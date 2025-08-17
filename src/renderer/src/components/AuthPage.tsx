import { SubmitHandler, useForm } from 'react-hook-form'
import NotificationBar from './NotificationBar'

interface FormData {
  username: string
  password: string
}

const AuthPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isValid, isLoading }
  } = useForm<FormData>()

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data)
  }

  return (
    <>
      <NotificationBar />
      <div className="bg-slate-100 ml-16 h-screen w-screen pr-16">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex justify-center items-center h-screen flex-col"
        >
          <div className="bg-[#003849] rounded-xl py-10 px-32">
            <div className="flex flex-col pb-4 w-full">
              <label htmlFor="name" className="text-white">
                Username
              </label>
              <input
                className="input input-bordered"
                id="name"
                type="text"
                placeholder="username"
                {...register('username', { required: true })}
              />
            </div>
            <div className="flex flex-col pb-4 w-full">
              <label htmlFor="pw" className="text-white">
                Password
              </label>
              <input
                className="input input-bordered"
                id="pw"
                type="password"
                placeholder="password"
                {...register('password', { required: true })}
              />
            </div>
            <button type="submit" className="w-full btn font-bold btn-accent" disabled={!isValid}>
              {isLoading ? 'Login...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default AuthPage
