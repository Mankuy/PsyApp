import { useEffect } from 'react'

export function useNotifications() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const shown = sessionStorage.getItem('notification-shown')
      if (!shown) {
        setTimeout(() => {
          new Notification('PsyApp', {
            body: 'Recordatorios activados',
            icon: '/icon-192.png',
          })
          sessionStorage.setItem('notification-shown', 'true')
        }, 3000)
      }
    }
  }, [])

  const scheduleReminder = (title: string, body: string, delayMs: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, { body, icon: '/icon-192.png' })
      }, delayMs)
    }
  }

  return { scheduleReminder }
}
