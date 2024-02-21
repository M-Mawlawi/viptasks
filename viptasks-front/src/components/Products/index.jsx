import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { backendURL } from '../../../config';
import apiService from "../../services/api";
import OpenModal from '../Modal';

const Products = (room) =>{
    const [products, setProducts] = useState([]);
    const [modalState, setModalState] = useState({isOpen:false,pId:null});

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const response = await apiService.getProducts(room);
            setProducts(response);
        } catch (error) {
            console.error('Error fetching Products:', error);
        }
    };
    const productsByCategory = products.reduce((acc, product) => {
        if (!acc[product.category_name]) {
          acc[product.category_name] = [];
        }
        acc[product.category_name].push(product);
        return acc;
      }, {});
    return(
        <div>
            {modalState.isOpen?(
            <OpenModal modalState={modalState} closeModal={()=>(setModalState({pId:null,isOpen:false}))}/>):null}
            <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
                {Object.keys(productsByCategory).map((categoryName) => (
                    <div key={categoryName}>
                    <h1 className='text-4xl mb-10'>{categoryName}</h1>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        
                            {productsByCategory[categoryName].map((product) => (
                            <a key={product.id} className="group">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                                    <img
                                    src={backendURL + product.item_photo}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                                    />
                                </div>
                                <div className='flex justify-between'>
                                    <div>
                                        <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                                        <p className="mt-1 text-lg font-medium text-gray-900">{product.price} €</p>
                                    </div>
                                    <button
                                        className="bg-logo-blue text-white font-bold uppercase text-sm px-6 h-12 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 mt-4 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => {setModalState({pId:product.id,isOpen:true});}}
                                    >
                                        Select
                                    </button>
                                </div>
                                
                            </a>
                            ))}
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}

export default Products;