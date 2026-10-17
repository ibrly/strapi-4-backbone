module.exports = {
  routes: [
    {
      method : 'POST',
      path   : '/reserve',
      handler: 'pay.payment',
      config : {
        policies   : [],
        middlewares: [],
      },
    },
  ],
};
