module.exports = {
    apps : [
    {
      name: 'Books Edunet Microservices',
      script: 'books.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6301  //7000
      }
    },
    {
      name: 'Videos - Edunet Microservices',
      script: 'videos.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port :   6302//7001
      }
    },
    {
      name: 'Games - Edunet Microservices',
      script: 'games.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6303//7002
      }
    },
    {
      name: 'Charity - Edunet Microservices',
      script: 'charities.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6304//7003
      }
    },
    {
      name: 'Tests - Edunet Microservices',
      script: 'tests.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6305//7004
      }
    },
    {
      name: 'Feeds - Edunet Microservices',
      script: 'feeds.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6306//7005
      }
    },
    {
      name: 'Accounts  - Edunet Dev Microservices',
      script: 'accounts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6307//7006
      }
    },
    {
      name: 'Ads  - Edunet Microservices',
      script: 'advertisements.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6308//7007
      }
    },
    {
      name: 'Reviews  - Edunet Microservices',
      script: 'reviews.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6309//7008
      }
    },
    {
      name: 'Events  - Edunet Microservices',
      script: 'events.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6310//7009
      }
    },
    {
      name: 'Bookings  - Edunet Microservices',
      script: 'bookings.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6311//7010
      }
    },
    {
      name: 'Movies  - Edunet Microservices',
      script: 'movie.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6312//7011
      }
    },
    {
      name: 'Products  - Edunet Microservices',
      script: 'store.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6313//7012
      }
    },
    {
      name: 'Masters  - Edunet Microservices',
      script: 'masters.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6314//7013
      }
    },
    {
      name: 'Favourites  - Edunet Microservices',
      script: 'favourites.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6315//7014
      }
    },
    {
      name: 'Contacts  - Edunet Microservices',
      script: 'contact.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6316//7015
      }
    },
    {
      name: 'Notifications - Edunet Microservices',
      script: 'notifications.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6318//7016
      }
    },
    {
      name: 'Theatre - Edunet Microservices',
      script: 'theatre.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6318//7017
      }
    },
    {
      name: 'Address - Edunet Microservices',
      script: 'address.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6319//7018
      }
    },
    {
      name: 'Cart - Edunet Microservices',
      script: 'cart.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6320//7019
      }
    },
    {
      name: 'Contest - Edunet Microservices',
      script: 'contest.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6321//7020
      }
    },
    {
      name: 'Shop Products - Edunet Microservices',
      script: 'shopProducts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6322//7021
      }
    },
    {
      name: 'Online class - Edunet Microservices',
      script: 'onlineClass.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6323//7022
      }
    },
    {
      name: 'tutor - Edunet Microservices',
      script: 'favouriteTutor.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'qa',
        port : 6324//7023
      }
    },
    ]
  };