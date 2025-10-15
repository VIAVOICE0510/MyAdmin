// NewSubCategoryForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewSubCategoryForm({ onCancel }) {
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState('');

  return (
    <div>
      <h4>ایجاد زیردسته جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>نام زیردسته</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="نام زیردسته را وارد کنید"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>دسته‌بندی والد</Form.Label>
          <Form.Control 
            type="text" 
            value={parentCategory} 
            onChange={(e) => setParentCategory(e.target.value)} 
            placeholder="دسته‌بندی والد را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
