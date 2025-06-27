"use client";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "contacts"), (snapshot) => {
      setContacts(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Contact))
      );
    });
    return () => unsub();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!form.firstName || !form.lastName || !form.phone) return;
    if (editId) {
      const ref = doc(db, "contacts", editId);
      await updateDoc(ref, form);
      setEditId(null);
    } else {
      await addDoc(collection(db, "contacts"), form);
    }
    setForm({ firstName: "", lastName: "", phone: "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      await deleteDoc(doc(db, "contacts", id));
    }
  };

  const startEdit = (contact: Contact) => {
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
    });
    setEditId(contact.id);
  };

  const handleCancleUpdate = async () => {
    setForm({ firstName: "", lastName: "", phone: "" });
    setEditId(null);
  };

  return (

    <div className="min-h-screen flex text-black">
      {/* Left Panel */}
      <div className="w-1/2 bg-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Contact List</h2>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="border p-4 mb-4 flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-semibold">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-blue-500">{contact.phone}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(contact)}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(contact.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-blue-100 p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          {editId ? "Edit Contact" : "Add New Contact"}
        </h2>
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="block w-full p-2 mb-3 border rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="block w-full p-2 mb-3 border rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="block w-full p-2 mb-3 border rounded"
        />
        <div className=" flex flex-row gap-4">
          <button
            onClick={handleAddOrUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editId ? "Update Contact" : "Add Contact"}
          </button>
          {editId ? <button 
            onClick={handleCancleUpdate}
            className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button> : <></>}
        </div>
      </div>
    </div>
  );
}
