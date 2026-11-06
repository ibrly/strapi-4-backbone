'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({strapi}) {
    // Without an origin the cors middleware sends no CORS headers at all, so
    // browsers block the frontend's cross-origin Socket.io requests.
    if (!process.env.SOCKET_FRONT_ORIGIN) {
      strapi.log.warn('SOCKET_FRONT_ORIGIN is not set; browsers will block Socket.io connections');
    }

    const io = require('socket.io')(
      strapi.server.httpServer,
      {
        cors: {
          origin     : process.env.SOCKET_FRONT_ORIGIN,
          methods    : [
            "GET",
            "POST"
          ],
          credentials: true
        }
      });

    io.on('connection',
          function (socket) {
            socket.on('meetupsChanged',
                      (res) => {
                        socket.broadcast.emit("fresh",
                                              {})
                      })
            socket.emit("hello",
                        JSON.stringify({message: "Welcome to my website"}));

          });

  }
};
