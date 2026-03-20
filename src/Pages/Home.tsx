import { useAppContext } from '../Context/AppContext'

export default function Home() {
    const { user } = useAppContext()

    return (
        <>
            <p>Welcome{user ? `, ${user.name}` : ''}!</p>
        </>
    )
}