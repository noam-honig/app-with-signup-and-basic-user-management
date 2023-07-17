import { useEffect, useState } from 'react'
import { remult } from 'remult'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthController } from './components/user/auth-controller'
import SignIn from './components/user/sign-in'
import { Users } from './components/user/users'
import { Roles } from './components/user/roles'
import SignUp from './components/user/sign-up'

function App() {
  const [_, render] = useState<{}>()
  const navigate = useNavigate()
  useEffect(() => {
    AuthController.currentUser().then((user) => {
      remult.user = user
      render({})
    })
  }, [])
  async function signOut() {
    await AuthController.signOut()
    remult.user = undefined
    render({})
  }
  if (_ === undefined) return <>loading</>
  return (
    <>
      {remult.authenticated() ? (
        <>
          <div>
            Hello {remult.user?.name}
            <button onClick={signOut}>sign out</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/">Home</Link>
            {remult.isAllowed(Roles.admin) && <Link to="/users">Users</Link>}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/signIn">Sign In</Link>
          <Link to="/signUp">Sign Up</Link>
        </div>
      )}

      <Routes>
        <Route
          path="/signIn"
          element={
            <SignIn
              signedIn={() => {
                navigate('/')
              }}
            />
          }
        />
        <Route
          path="/signUp"
          element={
            <SignUp
              signedIn={() => {
                navigate('/')
              }}
            />
          }
        />
        {remult.isAllowed(Roles.admin) && (
          <>
            <Route path="/users" element={<Users />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
