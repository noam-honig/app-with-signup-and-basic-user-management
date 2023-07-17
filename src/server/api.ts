import { remultExpress } from 'remult/remult-express'
import { AuthController } from '../components/user/auth-controller'
import { initRequest } from './server-session'
import { User } from '../components/user/user'

export const api = remultExpress({
  initRequest,
  entities: [User],
  controllers: [AuthController],
})
