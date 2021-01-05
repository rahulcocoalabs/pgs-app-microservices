module.exports = {
  development: {
    mongodb: {
      // url: 'mongodb+srv://developer:T4zs9mYUTrkWj37@edu2-os2mq.mongodb.net/Edunet?authSource=admin&replicaSet=Edu2-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true'
      url: 'mongodb://139.162.231.108:27017/Edunet'  
    },
    sql: {
      database: 'edunet',
      username: 'developer',
      password: 'Projects@2019.com'
    },
         
  },
  qa: {
    mongodb: {
      // url: 'mongodb+srv://developer:T4zs9mYUTrkWj37@edu2-os2mq.mongodb.net/Edunet?authSource=admin&replicaSet=Edu2-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true'
      url: 'mongodb://139.162.231.108:27017/Edunet'  
    },
    sql: {
      database: 'edunet',
      username: 'developer',
      password: 'Projects@2019.com'
    },
    // url: 'mongodb+srv://developer:VBFq4b3VIBIqQhku@cluster0-r9lse.mongodb.net/Edunet?retryWrites=true&w=majority'
  }

}


