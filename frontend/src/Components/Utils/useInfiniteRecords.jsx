import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_SIZE } from './pagination'

const useInfiniteRecords = (fetchPage, recordsKey, enabled = true, onError = () => {}) => {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(enabled)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(enabled)
    const [failed, setFailed] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const recordsRef = useRef([])
    const pageRef = useRef(1)
    const requestingRef = useRef(false)
    const requestIdRef = useRef(0)

    const requestPage = useCallback(async (page, append = false) => {
        if (append && requestingRef.current) return false
        const requestId = ++requestIdRef.current
        requestingRef.current = true
        setFailed(false)
        if (!append) setLoading(true)
        else setLoadingMore(true)

        try {
            const data = await fetchPage(page)
            if (requestId !== requestIdRef.current) return false
            const nextRecords = data[recordsKey]
            if (!Array.isArray(nextRecords)) {
                throw new Error(`The server returned an invalid ${recordsKey} list.`)
            }
            const updatedRecords = append ? [...recordsRef.current, ...nextRecords] : nextRecords
            recordsRef.current = updatedRecords
            setRecords(updatedRecords)
            pageRef.current = page
            setCurrentPage(page)
            setTotalCount(Number(data.totalCount) || 0)
            setHasMore(Boolean(data.hasMore))
            return true
        } catch (error) {
            if (requestId !== requestIdRef.current) return false
            setFailed(true)
            onError(error)
            return false
        } finally {
            if (requestId === requestIdRef.current) {
                requestingRef.current = false
                setLoading(false)
                setLoadingMore(false)
            }
        }
    }, [fetchPage, onError, recordsKey])

    const loadMore = useCallback(() => {
        if (hasMore && !requestingRef.current) {
            return requestPage(pageRef.current + 1, true)
        }
        return Promise.resolve(false)
    }, [hasMore, requestPage])

    const goToPage = useCallback(page => {
        if (Number.isInteger(page) && page >= 1 && page <= Math.ceil(totalCount / PAGE_SIZE)) {
            return requestPage(page)
        }
        return Promise.resolve(false)
    }, [requestPage, totalCount])

    const reload = useCallback(() => {
        pageRef.current = 1
        setHasMore(true)
        recordsRef.current = []
        setRecords([])
        return requestPage(1)
    }, [requestPage])

    const removeRecord = useCallback((id, getId = record => record._id) => {
        const remaining = recordsRef.current.filter(record => getId(record) !== id)
        const removedCount = recordsRef.current.length - remaining.length
        recordsRef.current = remaining
        setRecords(remaining)
        if (removedCount) setTotalCount(count => Math.max(0, count - removedCount))
    }, [])

    useEffect(() => {
        if (enabled) {
            pageRef.current = 1
            Promise.resolve().then(() => requestPage(1))
        }
    }, [enabled, requestPage])

    useEffect(() => {
        const lastPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
        if (totalCount > 0 && currentPage > lastPage) {
            Promise.resolve().then(() => requestPage(lastPage))
        }
    }, [currentPage, requestPage, totalCount])

    return {
        records,
        loading,
        loadingMore,
        hasMore,
        failed,
        currentPage,
        totalCount,
        pageSize: PAGE_SIZE,
        loadMore,
        goToPage,
        reload,
        removeRecord
    }
}

export default useInfiniteRecords
