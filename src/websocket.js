const socketio = require("socket.io");

const parseStringAsArray = require("./utils/parseStringAsArray");
const calculateDistance = require("./utils/calculateDistance");

let io;
const connections = [];

// exportando função de um modo mais rápido
// função que irá configurar o servidor para aceitar websockets
exports.setupWebsocket = server => {
  io = socketio(server);

  // ouvindo um evento de conexão (event listener)
  // toda vez que um usuário se conectar à aplicação por websocket
  io.on("connection", socket => {
    const { latitude, longitude, techs } = socket.handshake.query;

    connections.push({
      id: socket.id,
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude)
      },
      techs: parseStringAsArray(techs)
    });
  });
};

exports.findConnections = (coordinates, techs) => {
  return connections.filter(connection => {
    // comparando as coordenadas do novo dev cadastrado com as coordenadas
    // armazenadas em cada uma das conexões de websocket e vendo se essa distância
    // é menor do que 10km.
    // precisamos ver se dentro das tecnologias recebidas na conexão, pelo menos uma delas é igual à do dev cadastrado.
    return (
      calculateDistance(coordinates, connection.coordinates) < 10 &&
      connection.techs.some(item => techs.includes(item))
    );
  });
};

exports.sendMessage = (to, message, data) => {
  to.forEach(connection => {
    io.to(connection.id).emit(message, data);
  });
};
