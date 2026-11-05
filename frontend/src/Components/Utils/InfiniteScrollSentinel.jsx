import { useEffect, useRef } from 'react'

const InfiniteScrollSentinel = ({
    hasMore,
    loading,
    loadingMore,
    failed = false,
    observeWindowScroll = true,
    onLoadMore
}) => {
    const sentinelRef = useRef(null)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!observeWindowScroll || !sentinel || !hasMore || loading || loadingMore || failed) return undefined

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onLoadMore()
        }, { rootMargin: '200px' })

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [failed, hasMore, loading, loadingMore, observeWindowScroll, onLoadMore])

    if ((!hasMore && !loadingMore && !failed) || loading) return null

    return (
        <div ref={sentinelRef} className="infinite-scroll-status" aria-live="polite">
            {loadingMore
                ? <span role="status">Loading more…</span>
                : failed
                    ? <button type="button" className="btn btn-link" onClick={onLoadMore}>Retry loading</button>
                    : null}
        </div>
    )
}

export default InfiniteScrollSentinel
