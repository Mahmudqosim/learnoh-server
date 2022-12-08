const app = require("./app")
const connectDatabase = require("./config/database")

require('dotenv').config({ path: 'config/config.env' })

// Handle Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`)
  console.log(`Shutting down server due to ${err.name}`)
  console.log(err.stack)

  process.exit(1)
})

// Setting up config file

const PORT = process.env.PORT

// Connects to the Database
connectDatabase()

const server = app.listen(PORT, () => {
  console.log(
    `Server is listening on PORT: ${PORT} in ${process.env.NODE_ENV} mode.`
  )
})

// const io = require("socket.io")(server, { pingTimeout: 60000 })

/* io.on("connection", (socket) => {
})
 */

// Handle Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`)
  console.log(`Shutting down server due to ${err.name}`)
  console.log(err.stack)

  server.close(() => {
    process.exit(1)
  })
})
