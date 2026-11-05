import { useEffect, useRef } from 'react'
import { DataGrid } from '@mui/x-data-grid'

const GRID_PAGE_SIZE = 100

const InfiniteDataGrid = ({ rows, columns, hasMore, loadingMore, onLoadMore, ...props }) => {
    const rootRef = useRef(null)
    const gridPage = Math.max(0, Math.floor((rows.length - 1) / GRID_PAGE_SIZE))

    useEffect(() => {
        const scrollContainer = rootRef.current?.querySelector('.MuiDataGrid-virtualScroller')
        if (!scrollContainer) return undefined

        const handleScroll = () => {
            const distanceToBottom = scrollContainer.scrollHeight
                - scrollContainer.scrollTop
                - scrollContainer.clientHeight
            if (distanceToBottom < 160 && hasMore && !loadingMore) {
                onLoadMore()
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [hasMore, loadingMore, onLoadMore])

    return (
        <div ref={rootRef} className="infinite-data-grid-wrapper">
            <DataGrid
                rows={rows}
                columns={columns}
                paginationModel={{ page: gridPage, pageSize: GRID_PAGE_SIZE }}
                pageSizeOptions={[GRID_PAGE_SIZE]}
                hideFooter
                loading={loadingMore}
                {...props}
            />
        </div>
    )
}

export default InfiniteDataGrid
