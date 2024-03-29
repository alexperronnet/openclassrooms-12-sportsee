import { useState, useEffect, useMemo } from 'react'
import { extractActivity, extractAverageSessions, extractMainData, extractPerformance } from '@/utils'
import PropTypes from 'prop-types'

const dataUrl = import.meta.env.MODE === 'development' ? import.meta.env.VITE_MOCK_API : import.meta.env.VITE_API_URL
const extension = import.meta.env.MODE === 'development' ? '.json' : ''

/**
 * Hook that fetches data from the API.
 * @function useFetchData
 * @param {number} userId - The ID of the user.
 * @returns {object} Returns an object containing the fetched data, loading state, and error state.
 * @see {@link https://github.com/alexperronnet/openclassrooms-p12-sportsee-micro-api|API}
 */
export const useFetchData = userId => {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  const endpoints = useMemo(
    () => ({
      mainData: `${dataUrl}/${userId}${extension}`,
      activity: `${dataUrl}/${userId}/activity${extension}`,
      averageSessions: `${dataUrl}/${userId}/average-sessions${extension}`,
      performance: `${dataUrl}/${userId}/performance${extension}`
    }),
    [userId]
  )

  const fetchData = async () => {
    try {
      const [mainData, activity, averageSessions, performance] = await Promise.all(
        Object.values(endpoints).map(url => fetch(url).then(response => response.json()))
      )

      setData({
        mainData: extractMainData(mainData),
        activity: extractActivity(activity),
        averageSessions: extractAverageSessions(averageSessions),
        performance: extractPerformance(performance)
      })
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [userId])

  return { data, loading, error }
}

useFetchData.propTypes = {
  userId: PropTypes.number.isRequired
}
