import { atom } from 'jotai'

export interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

export const notificationsAtom = atom<Notification[]>([
  {
    id: 1,
    title: 'Bienvenue sur Kurama !',
    message: 'Nous sommes ravis de vous compter parmi nous. Commencez votre apprentissage dès maintenant.',
    time: 'Il y a 2h',
    read: false,
  },
  {
    id: 2,
    title: 'Rappel quotidien',
    message: 'N\'oubliez pas de maintenir votre série ! Faites une leçon aujourd\'hui.',
    time: 'Il y a 1j',
    read: true,
  },
])

export const unreadNotificationsCountAtom = atom((get) => {
  const notifications = get(notificationsAtom)
  return notifications.filter(n => !n.read).length
})

export const hasUnreadNotificationsAtom = atom((get) => {
  return get(unreadNotificationsCountAtom) > 0
})
