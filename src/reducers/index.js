import { combineReducers } from 'redux';
import ProductFormReducer from './ProductFormReducer';
import ProductReducer from './ProductReducer';
import KindReducer from './KindReducer';


export default combineReducers({
    productForm: ProductFormReducer,
    product: ProductReducer,
    kindP: KindReducer
});  