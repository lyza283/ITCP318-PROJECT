import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

const ListPagination = ({ currentPage, totalCount, pageSize, onChange, disabled = false }) => {
    const pageCount = Math.ceil(totalCount / pageSize)
    if (pageCount <= 1) return null

    return (
        <div className="d-flex justify-content-center mt-4">
            <Stack spacing={2}>
                <Pagination
                    count={pageCount}
                    page={currentPage}
                    onChange={(event, page) => onChange(page)}
                    disabled={disabled}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                />
            </Stack>
        </div>
    )
}

export default ListPagination
