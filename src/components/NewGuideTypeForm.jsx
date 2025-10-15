// NewGuideTypeForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewGuideTypeForm({ onCancel }) {
  const [name, setName] = useState('');

  return (
    <div>
      <h4>ایجاد نوع راهنمای جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>نام نوع راهنما</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="نام نوع راهنما را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
