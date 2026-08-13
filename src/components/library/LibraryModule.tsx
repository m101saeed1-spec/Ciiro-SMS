import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { LibraryBook } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  BookOpen,
  Calendar,
  CheckCircle2,
  BookCheck,
  ChevronDown
} from 'lucide-react';

export const LibraryModule: React.FC = () => {
  const { books, addBook, updateBook, deleteBook, borrowBook, returnBook, globalSearch } = useSchoolData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<string>('Last 30 days');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(['bk-2']); // Checkbox preselect as in reference image

  const [currentPage, setCurrentPage] = useState(3); // Matching page 3 in reference image!
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<LibraryBook | null>(null);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [deletingBook, setDeletingBook] = useState<LibraryBook | null>(null);

  // New Book Form
  const [formData, setFormData] = useState({
    name: '',
    writer: '',
    subject: 'English',
    class: '02',
    publishDate: '22 Oct, 2022',
    totalCopies: 10,
  });

  const [borrowerNameInput, setBorrowerNameInput] = useState(currentUser.name);

  const effectiveSearch = searchQuery || globalSearch;

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      b.writer.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      b.bookId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      b.subject.toLowerCase().includes(effectiveSearch.toLowerCase());

    if (filterPeriod === 'Available') return matchesSearch && b.status === 'Available';
    if (filterPeriod === 'Borrowed') return matchesSearch && b.status === 'Borrowed';
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 100; // 100 pages shown in demo like reference image
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelectAll = () => {
    if (selectedBookIds.length === paginatedBooks.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(paginatedBooks.map((b) => b.id));
    }
  };

  const toggleSelectBook = (id: string) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedBookIds((prev) => [...prev, id]);
    }
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    addBook({
      bookId: `#00${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name,
      writer: formData.writer,
      subject: formData.subject,
      class: formData.class,
      publishDate: formData.publishDate || '12 Sep, 2023',
      status: 'Available',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150',
      totalCopies: formData.totalCopies,
      availableCopies: formData.totalCopies,
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      writer: '',
      subject: 'English',
      class: '02',
      publishDate: '22 Oct, 2022',
      totalCopies: 10,
    });
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowingBook) return;
    borrowBook(borrowingBook.id, borrowerNameInput, currentUser.role);
    setBorrowingBook(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Breadcrumb matching reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library</h1>
          <nav className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-slate-400 hover:text-slate-600">Home</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Library Books</span>
          </nav>
        </div>

        {/* Top Right + Add Library Button matching reference image */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl border border-purple-600 text-purple-600 font-bold text-xs hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Library</span>
        </button>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6">
        {/* Table Filter Controls Header matching reference image */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold text-slate-900">All Books</h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input: Search by name or roll */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or roll"
                className="w-full bg-slate-50/80 border border-slate-100 rounded-xl py-2 pl-4 pr-9 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white"
              />
              <Search className="w-4 h-4 text-purple-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date / Status Filter Dropdown: Last 30 days */}
            <div className="relative">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="appearance-none bg-slate-50/80 border border-slate-100 rounded-xl py-2 pl-8 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="Last 30 days">Last 30 days</option>
                <option value="All Books">All Books</option>
                <option value="Available">Available Books</option>
                <option value="Borrowed">Borrowed Books</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Books Table matching reference image layout & columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50/40 border-b border-purple-100/50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 pl-6 w-10">
                  <input
                    type="checkbox"
                    checked={selectedBookIds.length === paginatedBooks.length && paginatedBooks.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Book Name</th>
                <th className="py-3 px-4">Writer</th>
                <th className="py-3 px-4">Id</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Publish Date</th>
                <th className="py-3 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No books found in library catalog.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book) => {
                  const isSelected = selectedBookIds.includes(book.id);
                  return (
                    <tr
                      key={book.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-purple-50/40' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 pl-6">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectBook(book.id)}
                          className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
                        />
                      </td>

                      {/* Book Name with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900 shrink-0 border border-slate-200 shadow-2xs flex items-center justify-center text-white text-[10px] font-bold">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{book.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{book.name}</span>
                            {book.status === 'Borrowed' && (
                              <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 rounded">
                                Borrowed by {book.borrowerName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">{book.writer}</td>

                      {/* Id matching #0011 style */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">{book.bookId}</td>

                      <td className="py-3.5 px-4 text-slate-700">{book.subject}</td>

                      {/* Class format matching 01, 02 in image */}
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{book.class}</td>

                      <td className="py-3.5 px-4 text-slate-600">{book.publishDate}</td>

                      {/* Actions matching reference image: Trash, Edit + Borrow/Return */}
                      <td className="py-3.5 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {book.status === 'Available' ? (
                            <button
                              onClick={() => setBorrowingBook(book)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition-colors"
                            >
                              Borrow
                            </button>
                          ) : (
                            <button
                              onClick={() => returnBook(book.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                            >
                              Return
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingBook(book)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingBook(book)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching reference image layout */}
        <Pagination
          currentPage={currentPage}
          totalPages={100}
          pageSize={pageSize}
          totalItems={1000}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Add Library Book Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Library Book">
        <form onSubmit={handleCreateBook} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Book Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Advanced Physics Principles"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Writer / Author</label>
              <input
                type="text"
                required
                value={formData.writer}
                onChange={(e) => setFormData({ ...formData, writer: e.target.value })}
                placeholder="e.g. Wade Warren"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Physics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
              <input
                type="text"
                required
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="02"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Publish Date</label>
              <input
                type="text"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                placeholder="22 Oct, 2022"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Add Book to Library
          </button>
        </form>
      </Modal>

      {/* Borrow Book Modal */}
      {borrowingBook && (
        <Modal
          isOpen={!!borrowingBook}
          onClose={() => setBorrowingBook(null)}
          title={`Borrow "${borrowingBook.name}"`}
          maxWidth="sm"
        >
          <form onSubmit={handleBorrowSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Book ID: <span className="font-bold text-slate-800">{borrowingBook.bookId}</span> | Subject: {borrowingBook.subject}
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Borrower Name</label>
              <input
                type="text"
                required
                value={borrowerNameInput}
                onChange={(e) => setBorrowerNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
            >
              Confirm Borrow
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Book Confirmation */}
      {deletingBook && (
        <Modal
          isOpen={!!deletingBook}
          onClose={() => setDeletingBook(null)}
          title="Delete Library Book"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to remove <span className="font-bold text-slate-800">{deletingBook.name}</span> ({deletingBook.bookId})?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingBook(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteBook(deletingBook.id);
                setDeletingBook(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
