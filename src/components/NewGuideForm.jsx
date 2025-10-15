// NewGuideForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewGuideForm({ onCancel }) {
  const [title, setTitle] = useState('');

  return (
    <div>
      <h4>ایجاد راهنمای جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>عنوان راهنما</Form.Label>
          <Form.Control 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="عنوان راهنما را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
