// UsersTable.tsx
import React from 'react';
import { Table, Button } from 'react-bootstrap';

export default function UsersTable({ users, onNewUser }) {
  return (
    <div>
      <h4>کاربران</h4>
      <Button className="mb-3" onClick={onNewUser}>کاربر جدید</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام کاربر</th>
            <th>ایمیل</th>
            <th>تاریخ ثبت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.createdAt}</td>
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
