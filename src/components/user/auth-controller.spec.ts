import { InMemoryDataProvider, remult } from 'remult'
import { beforeEach, describe, test, expect } from 'vitest'
import { AuthController } from './auth-controller'

describe('test auth controller', () => {
  beforeEach(() => {
    remult.dataProvider = new InMemoryDataProvider()
    remult.context.session = {}
  })
  test('Invalid User Fails', async () => {
    await expect(AuthController.signIn('no', 'no')).rejects.toThrow()
  })
  test('signup without a name fails', async () => {
    await expect(
      AuthController.signUp({ name: '', username: '1', password: '1' })
    ).rejects.toThrow()
  })
  test('signup without a password fails', async () => {
    await expect(
      AuthController.signUp({ name: 'name', username: '1', password: '' })
    ).rejects.toThrow()
  })
  test('signup and sign in works', async () => {
    await AuthController.signUp({ name: 'a', username: 'a', password: 'a' })
    expect((await AuthController.signIn('a', 'a')).name).toEqual('a')
  })
  test('wrong password', async () => {
    await AuthController.signUp({ name: 'a', username: 'a', password: 'a' })
    await expect(AuthController.signIn('a', 'b')).rejects.toThrow()
  })
  test('first user is admin', async () => {
    expect(
      (await AuthController.signUp({ name: 'a', username: 'a', password: 'a' }))
        .roles
    ).toEqual(['admin'])
    expect(
      (await AuthController.signUp({ name: 'b', username: 'b', password: 'a' }))
        .roles
    ).toEqual([])
  })
  test("user that doesn't have a password, the password they'll enter will be determined as their password for next logins", async () => {
    const user = await AuthController.signUp({
      name: 'a',
      username: 'a',
      password: 'a',
    })
    await AuthController.resetPassword(user.id)
    expect((await AuthController.signIn('a', 'c')).name).toEqual('a')
    await expect(AuthController.signIn('a', 'b')).rejects.toThrow()
  })
})
