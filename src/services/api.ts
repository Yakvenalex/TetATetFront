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

export interface PartnerSearchParams {
  id: number
  gender: string
  age_from: number | null
  age_to: number | null
}

export interface PartnerSearchResponse {
  status: 'matched' | 'waiting'
  room_key?: string
  partner?: {
    id: number
    name: string
    // добавьте другие поля партнера по необходимости
  }
  message?: string
  token?: string
}

export const findPartner = async (
  params: PartnerSearchParams
): Promise<PartnerSearchResponse> => {
  try {
    const response = await fetch(`${BASE_SITE}/api/find-partner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Ошибка при поиске партнера:', error)
    throw error
  }
}
