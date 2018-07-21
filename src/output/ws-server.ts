import WebSocket from 'ws'

type Payload = Record<string, any>

class WsServer {
  private server: WebSocket.Server
  private actions: Map<string, (payload: Payload) => void> = new Map()

  constructor() {
    this.server = new WebSocket.Server({ port: 8080 })
  }

  public init() {
    this.server.on('connection', (ws) => ws.on('message', this.hanndleMessage))
  }

  public broadcast(action: string, payload: Payload) {
    this.server.clients.forEach((ws) => ws.send(JSON.stringify({ action, payload })))
  }

  public registerAction(actionName: string, actionFn: (payload: Payload) => void) {
    if (this.actions.has(actionName)) return

    this.actions.set(actionName, actionFn)
  }

  private hanndleMessage = (raw: string | Buffer) => {
    const body = raw.toString()
    const parsed = JSON.parse(body)
    if (!parsed || !parsed.action || !parsed.payload) return

    const { action, payload } = parsed
    if (!this.actions.has(action)) return

    this.actions.get(action)(payload)
  }
}

export const wsServer = new WsServer()