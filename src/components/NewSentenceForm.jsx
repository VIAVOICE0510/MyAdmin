// NewSentenceForm.tsx
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function NewSentenceForm({ onCancel }) {
  const [text, setText] = useState('');

  return (
    <div>
      <h4>ایجاد جمله جدید</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>متن جمله</Form.Label>
          <Form.Control 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="متن جمله را وارد کنید"
          />
        </Form.Group>
        <Button variant="success" className="me-2">ذخیره</Button>
        <Button variant="secondary" onClick={onCancel}>انصراف</Button>
      </Form>
    </div>
  );
}
