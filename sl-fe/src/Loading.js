
function Loading() {
    console.log("do loading")
    return(
    <div className="d-flex justify-content-around align-items-center" style={{height:'100%'}}>
        <div/>
        <div/>
        <div className="spinner-grow spinner-grow-sm" role="status" style={{color: 'Gainsboro'}}>
            {/* <span className="sr-only">Loading...</span> */}
        </div>
        <div className="spinner-grow spinner-grow-sm" role="status" style={{color: 'Gainsboro'}}>
            {/* <span className="sr-only">Loading...</span> */}
        </div>
        <div className="spinner-grow spinner-grow-sm" role="status" style={{color: 'Gainsboro'}}>
            {/* <span className="sr-only">Loading...</span> */}
        </div>
        <div/>
        <div/>
    </div>);

}

export default Loading;