type ClickEvent = {
  linkId: string;
  country: string;
  device: string;
  createdAt: number;
};

export class AnalyticsDO {
  state: DurableObjectState;
  env: any;
  private buffer: ClickEvent[] = [];

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    const body = (await request.json()) as {
      linkId: string;
      country: string;
      device: string;
    };

    this.buffer.push({
      linkId: body.linkId,
      country: body.country,
      device: body.device,
      createdAt: Date.now(),
    });

    if (this.buffer.length >= 10) {
      await this.flush();
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  private async flush() {
    const events = [...this.buffer];
    this.buffer = [];

    for (const event of events) {
      await this.env.DB.prepare(
        `INSERT INTO clicks (id, link_id, country, device, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
        .bind(
          crypto.randomUUID(),
          event.linkId,
          event.country,
          event.device,
          event.createdAt,
        )
        .run();
    }
  }
}
