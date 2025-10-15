// NewRoleForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewRoleForm({ onCancel }) {
  const [name, setName] = useState('');

  return (
    <div>
      <h4>ایجاد نقش جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>نام نقش</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="نام نقش را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
