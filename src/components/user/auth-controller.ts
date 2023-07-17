import { Allow, BackendMethod, remult } from 'remult'
import { User, userRepo } from './user'
import { generate, verify } from 'password-hash'
import { setSessionUser } from '../../server/server-session'
import { Roles } from './roles'

export class AuthController {
  @BackendMethod({ allowed: Allow.authenticated })
  static async resetPassword(id: string) {
    const userRepo = remult.repo(User)
    const user = await userRepo.findId(id)
    if (!user) throw new Error('Invalid User')
    user.password = ''
    await userRepo.save(user)
    return 'Done'
  }

  @BackendMethod({ allowed: true })
  static async signUp(info: SignUpInfo) {
    if (!info.password) throw Error('Password is required')
    const user = await userRepo.insert({
      // I Don't use spread, to prevent property injection - for example admin
      name: info.name,
      username: info.username,
      password: generate(info.password),
      //The first user that signs in, is determined as an admin.
      admin: (await userRepo.count()) === 0,
    })
    return setSessionUserBasedOnUser(user)
  }

  @BackendMethod({ allowed: true })
  /**
   * This sign mechanism represents a simplistic sign in management utility with the following behaviors
   * When a user that has no password signs in, that password that they've signed in with is set as the users password
   */
  static async signIn(username: string, password: string) {
    let user = await userRepo.findFirst({ username })
    if (user) {
      if (!user.password) {
        // if the user has no password defined, the first password they use is their password
        user.password = generate(password)
        await userRepo.save(user)
      }

      if (verify(password, user.password)) {
        return setSessionUserBasedOnUser(user)
      }
    }
    throw new Error('Invalid Sign In')
  }
  @BackendMethod({ allowed: true })
  static async currentUser() {
    return remult.user
  }
  @BackendMethod({ allowed: Allow.authenticated })
  static async signOut() {
    return setSessionUser(undefined!)
  }
}

export type SignUpInfo = Pick<User, 'name' | 'username' | 'password'>
function setSessionUserBasedOnUser(user: User) {
  return setSessionUser({
    id: user.id,
    name: user.name,
    roles: user.admin ? [Roles.admin] : [],
  })
}
