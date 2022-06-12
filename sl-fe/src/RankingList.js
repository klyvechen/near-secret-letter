import React, { useEffect, useState } from 'react';


function RankList() {
    const [rankList, setRankList] = useState([]);

    return(
        rankList.map((n, i)=>{
            <ul class="list-group list-group-horizontal">
            <li class="list-group-item">An item</li>
            <li class="list-group-item">A second item</li>
            <li class="list-group-item">A third item</li>
          </ul>
        }));

}

export default RankList;