// NewUserForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewUserForm({ onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div>
      <h4>ایجاد کاربر جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>نام کاربر</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="نام کاربر را وارد کنید"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>ایمیل</Form.Label>
          <Form.Control 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="ایمیل را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
