class UserServer {
  constructor() {
    this.peers = []; // Lista de dispositivos conectados
    this.userCount = 0; // Contador de usuários
    this.peerId = Math.random().toString(36).substring(7); // ID único para cada usuário
    this.setupWebRTC(); // Configura a conexão P2P
  }

  // Configura a conexão WebRTC
  setupWebRTC() {
    // Usamos um servidor de sinalização simples (WebSocket) para trocar informações de conexão
    this.signalingServer = new WebSocket('wss://seu-servidor-de-sinalizacao.com');

    this.signalingServer.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'signal') {
        // Recebe um sinal de outro usuário e estabelece a conexão P2P
        this.connectToPeer(message.data);
      } else if (message.type === 'userCount') {
        // Atualiza o contador de usuários
        this.userCount = message.data;
        this.updateUI();
      }
    };

    // Envia o ID do usuário para o servidor de sinalização
    this.signalingServer.onopen = () => {
      this.signalingServer.send(JSON.stringify({ type: 'join', id: this.peerId }));
    };
  }

  // Conecta a outro usuário
  connectToPeer(signal) {
    const peer = new SimplePeer({ initiator: false, trickle: false });

    peer.on('signal', (data) => {
      // Envia o sinal de conexão para o servidor de sinalização
      this.signalingServer.send(JSON.stringify({ type: 'signal', data }));
    });

    peer.signal(signal); // Estabelece a conexão com o outro usuário

    peer.on('connect', () => {
      console.log('Conexão P2P estabelecida!');
      this.peers.push(peer);
    });

    peer.on('data', (data) => {
      // Recebe dados de outros usuários (não é necessário para o contador)
      console.log('Dados recebidos:', data.toString());
    });
  }

  // Atualiza a interface do usuário
  updateUI() {
    document.getElementById('userCount').textContent = this.userCount;
  }
}

// Inicializa o UserServer quando a página carrega
window.onload = () => {
  const userServer = new UserServer();
};