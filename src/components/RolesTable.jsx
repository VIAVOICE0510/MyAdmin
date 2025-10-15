// RolesTable.tsx
import React from 'react';
import { Table, Button } from 'react-bootstrap';

export default function RolesTable({ roles, onNewRole }) {
  return (
    <div>
      <h4>نقش‌ها</h4>
      <Button className="mb-3" onClick={onNewRole}>نقش جدید</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام نقش</th>
            <th>تاریخ ایجاد</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role.id}>
              <td>{index + 1}</td>
              <td>{role.name}</td>
              <td>{role.createdAt}</td>
              <td>
                <Button size="sm" variant="primary" className="me-2">ویرایش</Button>
                <Button size="sm" variant="danger">غیرفعال کردن</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
