import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'

const NewCollections = () => {

    const [new_colections, setNew_collections] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/newcollection')
            .then((response) => response.json())
            .then((data) => setNew_collections(data))
    }, [])

    return (
        <div className='new-collections'>
            <h1>NEW COLLECTIONS</h1>
            <hr />
            <div className="collections">
                {new_colections.map((item, i) => {
                    return <Item
                        key={i}
                        id={item.id}
                        name={item.name}
                        image={item.image}
                        new_prices={item.new_price}
                        old_prices={item.old_price}
                    />
                })}
            </div>
        </div>
    )
}

export default NewCollections