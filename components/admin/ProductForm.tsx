import { useFormValidation } from '@/hooks/useFormValidation';

interface ProductFormData {
  title: string;
  price: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const validationRules = {
  title: { required: true, minLength: 2, maxLength: 100 },
  price: { 
    required: true, 
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Price must be a positive number';
      return null;
    }
  },
  description: { required: true, minLength: 10, maxLength: 500 },
  category: { required: true },
  imageUrl: { 
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
        return 'Please enter a valid image URL';
      }
      return null;
    }
  }
};

const initialFormData: ProductFormData = {
  title: '',
  price: '',
  description: '',
  category: '',
  imageUrl: ''
};

export default function ProductForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: ProductFormProps) {
  const {
    data,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateAll,
    resetForm
  } = useFormValidation({ ...initialFormData, ...initialData }, validationRules);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      if (!isEditing) resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Product Title"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={data.price}
              onChange={(e) => updateField('price', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={`w-full border rounded px-3 py-2 h-20 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <select
              value={data.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={data.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              className={`w-full border rounded px-3 py-2 ${errors.imageUrl ? 'border-red-500' : ''}`}
            />
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}