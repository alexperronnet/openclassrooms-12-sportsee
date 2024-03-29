import { useNavigate } from 'react-router-dom'
import css from '@/pages/login/login.module.scss'

const users = [
  { id: 12, name: 'Utilisateur 12' },
  { id: 18, name: 'Utilisateur 18' }
]

/**
 * Component that renders the login page for the application.
 * @function Login
 * @returns {JSX.Element} Returns the Login component.
 */
export const Login = () => {
  const navigate = useNavigate()

  const handleLogin = id => localStorage.setItem('userId', id) || navigate('/app')

  return (
    <section className={css.login}>
      <h1 className={css.title}>Connexion</h1>
      <p className={css.alert}>
        Projet 12 de la formation OpenClassrooms, réalisation d&apos;un tableau de bord de suivi de sportifs. Pour
        accéder à l&apos;application,veuillez vous connecter avec l&apos;un des identifiants suivants :
      </p>
      <div className={css.form}>
        {users.map(user => (
          <button className={css.formButton} key={user.id} onClick={() => handleLogin(user.id)}>
            {user.name}
          </button>
        ))}
      </div>
    </section>
  )
}
