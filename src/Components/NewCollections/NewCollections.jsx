import React from 'react'
import './NewCollections.css'
import new_colections from '../Assets/new_collections'
import Item from '../Item/Item'

const NewCollections = () => {
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