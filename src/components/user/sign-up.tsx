import { FormEvent, useState } from 'react'

import { remult, ErrorInfo } from 'remult'
import { AuthController, SignUpInfo } from './auth-controller'

export default function SignUp({ signedIn }: { signedIn: VoidFunction }) {
  const [info, setInfo] = useState<SignUpInfo & { confirmPassword: string }>({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<ErrorInfo<typeof info>>()
  async function signUp(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    if (!info.password) {
      setError({
        modelState: {
          password: 'Required',
        },
      })
    } else if (info.password != info.confirmPassword) {
      setError({
        modelState: {
          confirmPassword: 'Does not match password',
        },
      })
    } else {
      try {
        const result = await AuthController.signUp(info)
        remult.user = result
        signedIn()
      } catch (err: any) {
        setError(err)
      }
    }
  }
  return (
    <>
      <form onSubmit={signUp}>
        {(
          [
            'name',
            'username',
            'password',
            'confirmPassword',
          ] as (keyof typeof info)[]
        ).map((field) => (
          <div key={field}>
            <input
              placeholder={field}
              value={info[field]}
              type={field.includes('assword') ? 'password' : 'text'}
              onChange={(e) => setInfo({ ...info, [field]: e.target.value })}
            />
            <div>{error?.modelState?.[field]}</div>
          </div>
        ))}
        {error && <div>{error.message}</div>}
        <button>sign in</button>
      </form>
    </>
  )
}
