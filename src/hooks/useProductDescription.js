/**
 * Created by Dima Portenko on 14.05.2020
 */
import { useEffect, useState } from 'react';
import { getProductCustomAttribute } from '../helper/product';

export const useProductDescription = ({ product }) => {
  const [shortdescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const attribute = getProductCustomAttribute(product, 'short_description');
    if (attribute) {
      setShortDescription(attribute.value);
    }
  }, [product]);

  useEffect(() => {
    const long_description = getProductCustomAttribute(product, 'description');
    if (long_description) {
      setDescription(long_description.value);
    }
  }, [product]);

  return {
    shortdescription,
    description,
  };
};
