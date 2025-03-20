export const BASE_SITE: string = 'https://chatbackend-yakvenalex.amvera.io'
export const CENTRIFUGO_URL: string =
  'wss://mycentrifugo-yakvenalex.amvera.io/connection/websocket'

export const clearRoom = async (originalRoom: string): Promise<void> => {
  try {
    const response = await fetch(
      `${BASE_SITE}/api/clear_room/${originalRoom}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error('Ошибка при очистке комнаты:', error)
  }
}

export const sendSystemMessage = async (
  message: string,
  room: string,
  user_id: number
) => {
  try {
    await fetch(`${BASE_SITE}/api/send-msg/${room}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'Система',
        user_id: user_id,
        message: message,
      }),
    })
  } catch (error) {
    console.error('Ошибка при отправке системного сообщения:', error)
  }
}
