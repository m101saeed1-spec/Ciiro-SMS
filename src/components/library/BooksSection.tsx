import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { LibraryBook, BookCategory, BOOK_CATEGORIES } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { FileUploadDropzone, UploadedFileData } from './FileUploadDropzone';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  LayoutGrid,
  List,
  Heart,
  Bookmark,
  Star,
  Globe,
  FileText,
  Sparkles,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Copy,
  Check,
  Building,
  Hash,
  BookMarked,
  Info,
} from 'lucide-react';

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=300',
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'General Knowledge': { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'Business & Entrepreneurship': { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'Technology & Computing': { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  'Science': { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  'History': { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'Geography': { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  'Literature': { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  'Personal Development': { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  'Leadership': { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  'Economics': { bg: 'bg-lime-50 dark:bg-lime-950/50', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800' },
  'Health & Wellness': { bg: 'bg-pink-50 dark:bg-pink-950/50', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  'Religion & Philosophy': { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  'Languages': { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  'Arts & Culture': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50', text: 'text-fuchsia-700 dark:text-fuchsia-300', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
  'Reference': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  'Other': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
};

export const BooksSection: React.FC = () => {
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    toggleFavoriteBook,
    borrowBook,
    returnBook,
    downloadFile,
    globalSearch,
  } = useSchoolData();

  const { currentUser, activeRole } = useAuth();
  const isStaffOrAdmin = activeRole === 'Admin' || activeRole === 'Teacher';

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [filterLanguage, setFilterLanguage] = useState<string>('All Languages');
  const [filterStatus, setFilterStatus] = useState<string>('All Status');
  const [filterFormat, setFilterFormat] = useState<string>('All Formats');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [deletingBook, setDeletingBook] = useState<LibraryBook | null>(null);
  const [borrowingBook, setBorrowingBook] = useState<LibraryBook | null>(null);
  const [detailBook, setDetailBook] = useState<LibraryBook | null>(null);
  const [readingBook, setReadingBook] = useState<LibraryBook | null>(null);

  // Reader state
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [readerFontSize, setReaderFontSize] = useState<number>(15);
  const [copiedText, setCopiedText] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    writer: string;
    category: BookCategory | string;
    language: string;
    description: string;
    publisher: string;
    edition: string;
    pages: number;
    isbn: string;
    publishDate: string;
    totalCopies: number;
    coverImage: string;
    file: UploadedFileData | null;
  }>({
    name: '',
    writer: '',
    category: 'General Knowledge',
    language: 'English',
    description: '',
    publisher: 'Academic Publishing House',
    edition: '1st Edition',
    pages: 280,
    isbn: '978-0-12-345678-9',
    publishDate: '2024',
    totalCopies: 10,
    coverImage: COVER_PRESETS[0],
    file: null,
  });

  const [borrowerNameInput, setBorrowerNameInput] = useState(currentUser.name);

  const effectiveSearch = searchQuery || globalSearch;

  // Language options dynamically extracted
  const availableLanguages = [
    'All Languages',
    ...Array.from(new Set(books.map((b) => b.language || 'English'))),
  ];

  // Count favorites
  const totalFavoritesCount = books.filter((b) => b.isFavorite).length;

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const q = effectiveSearch.toLowerCase();
    const matchesSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.writer.toLowerCase().includes(q) ||
      b.bookId.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.language && b.language.toLowerCase().includes(q)) ||
      (b.publisher && b.publisher.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q));

    const matchesCategory =
      filterCategory === 'All Categories' ||
      (b.category && b.category.toLowerCase() === filterCategory.toLowerCase());

    const matchesLanguage =
      filterLanguage === 'All Languages' ||
      (b.language && b.language.toLowerCase() === filterLanguage.toLowerCase());

    const matchesStatus =
      filterStatus === 'All Status' ||
      (filterStatus === 'Available' && b.status === 'Available') ||
      (filterStatus === 'Borrowed' && b.status === 'Borrowed');

    const matchesFormat =
      filterFormat === 'All Formats' ||
      (filterFormat === 'Digital' && !!b.fileName) ||
      (filterFormat === 'Physical' && !b.fileName);

    const matchesFavorites = !onlyFavorites || b.isFavorite;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLanguage &&
      matchesStatus &&
      matchesFormat &&
      matchesFavorites
    );
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
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

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      name: '',
      writer: '',
      category: 'General Knowledge',
      language: 'English',
      description: '',
      publisher: 'Oxford Academic Press',
      edition: '1st Edition',
      pages: 320,
      isbn: '978-0-12-345678-9',
      publishDate: '2024',
      totalCopies: 10,
      coverImage: COVER_PRESETS[Math.floor(Math.random() * COVER_PRESETS.length)],
      file: null,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: LibraryBook) => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      writer: book.writer,
      category: book.category || 'General Knowledge',
      language: book.language || 'English',
      description: book.description || '',
      publisher: book.publisher || 'Academic Publishing',
      edition: book.edition || '1st Edition',
      pages: book.pages || 300,
      isbn: book.isbn || '978-0-00-000000-0',
      publishDate: book.publishDate || '2023',
      totalCopies: book.totalCopies || 10,
      coverImage: book.coverImage || COVER_PRESETS[0],
      file: book.fileName
        ? {
            fileName: book.fileName,
            fileSize: book.fileSize || '3.5 MB',
            fileType: (book.fileType as any) || 'pdf',
            fileData: book.fileData,
          }
        : null,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.writer.trim()) return;

    const filePayload = formData.file;

    if (editingBook) {
      updateBook(editingBook.id, {
        name: formData.name,
        writer: formData.writer,
        category: formData.category,
        language: formData.language,
        description: formData.description,
        publisher: formData.publisher,
        edition: formData.edition,
        pages: Number(formData.pages) || 300,
        isbn: formData.isbn,
        publishDate: formData.publishDate,
        totalCopies: Number(formData.totalCopies) || 10,
        coverImage: formData.coverImage,
        fileName: filePayload?.fileName,
        fileSize: filePayload?.fileSize,
        fileType: filePayload?.fileType,
        fileData: filePayload?.fileData,
      });
    } else {
      addBook({
        bookId: `#0${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name,
        writer: formData.writer,
        category: formData.category,
        language: formData.language,
        description: formData.description,
        publisher: formData.publisher,
        edition: formData.edition,
        pages: Number(formData.pages) || 300,
        isbn: formData.isbn,
        publishDate: formData.publishDate || '2024',
        status: 'Available',
        coverImage: formData.coverImage || COVER_PRESETS[0],
        totalCopies: Number(formData.totalCopies) || 10,
        availableCopies: Number(formData.totalCopies) || 10,
        isFavorite: false,
        rating: 4.8,
        fileName: filePayload?.fileName,
        fileSize: filePayload?.fileSize,
        fileType: filePayload?.fileType,
        fileData: filePayload?.fileData,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowingBook) return;
    borrowBook(borrowingBook.id);
    setBorrowingBook(null);
  };

  const handleCopyReaderText = () => {
    if (readingBook?.fileData) {
      navigator.clipboard.writeText(readingBook.fileData);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Bar (Horizontal Scrollable Carousel) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              General Knowledge Categories
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {books.length} Books in Collection
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* All Categories Chip */}
          <button
            onClick={() => {
              setFilterCategory('All Categories');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              filterCategory === 'All Categories'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Categories</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterCategory === 'All Categories'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {books.length}
            </span>
          </button>

          {/* 16 Category Pills */}
          {BOOK_CATEGORIES.map((cat) => {
            const count = books.filter(
              (b) => b.category?.toLowerCase() === cat.toLowerCase()
            ).length;
            const isSelected = filterCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Secondary Filters & View Mode Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search books by title, author, keyword, category, publisher, or ISBN..."
              className="w-full bg-slate-50/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-4 pr-10 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-slate-800 font-medium"
            />
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Favorites Filter Toggle */}
            <button
              onClick={() => {
                setOnlyFavorites(!onlyFavorites);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                onlyFavorites
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title="Filter by Saved/Favorite Books"
            >
              <Heart
                className={`w-4 h-4 ${
                  onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
              <span>Favorites</span>
              {totalFavoritesCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {totalFavoritesCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add Book Button (Faculty & Admin) */}
            {isStaffOrAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Book to Catalog</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              General Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {BOOK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Language
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => {
                setFilterLanguage(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {availableLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Format / Digital
            </label>
            <select
              value={filterFormat}
              onChange={(e) => {
                setFilterFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Formats">All Formats</option>
              <option value="Digital">Digital E-Book (With File)</option>
              <option value="Physical">Physical Library Copy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Availability
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Status">All Availability</option>
              <option value="Available">Available to Read/Borrow</option>
              <option value="Borrowed">Currently Borrowed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Books Content Display */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Books Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            No books matched your active search query or category filters. Try clearing your filters or searching with different keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('All Categories');
              setFilterLanguage('All Languages');
              setFilterStatus('All Status');
              setFilterFormat('All Formats');
              setOnlyFavorites(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedBooks.map((book) => {
            const catColors =
              CATEGORY_COLORS[book.category] || CATEGORY_COLORS['Other'];

            return (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Banner */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5 relative shadow-inner">
                    {book.coverImage && book.coverImage.trim() !== '' ? (
                      <img
                        src={book.coverImage}
                        alt={book.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-900 text-white font-bold text-2xl">
                        {book.name.charAt(0)}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Left: Book ID */}
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white">
                      {book.bookId}
                    </span>

                    {/* Top Right: Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteBook(book.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        book.isFavorite
                          ? 'bg-rose-500/90 text-white shadow-sm'
                          : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                      }`}
                      title={
                        book.isFavorite
                          ? 'Remove from Favorites'
                          : 'Add to Favorites'
                      }
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          book.isFavorite ? 'fill-white' : ''
                        }`}
                      />
                    </button>

                    {/* Bottom Info: Digital Attachment format or copies */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px] font-semibold">
                      {book.fileName ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-xs flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span className="uppercase">{book.fileType || 'PDF'}</span>
                          <span>•</span>
                          <span>{book.fileSize || '3.2 MB'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs">
                          {book.availableCopies}/{book.totalCopies} Copies
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          book.status === 'Available'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-amber-500/90 text-white'
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                  </div>

                  {/* Category & Language Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                    >
                      {book.category}
                    </span>
                    {book.language && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" />
                        <span>{book.language}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Writer */}
                  <h3
                    onClick={() => setDetailBook(book)}
                    className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 transition-colors cursor-pointer"
                    title={book.name}
                  >
                    {book.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    By {book.writer}
                  </p>

                  {/* Synopsis snippet */}
                  {book.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}

                  {/* Publication Year & Publisher */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="truncate max-w-[120px]">
                      {book.publisher || 'Published'}
                    </span>
                    <span>{book.publishDate}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Read / Preview Button */}
                    <button
                      onClick={() => setReadingBook(book)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Read Book Synopsis & Content"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </button>

                    {/* Details Modal Trigger */}
                    <button
                      onClick={() => setDetailBook(book)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="View Complete Specifications"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Download Button if file attached */}
                    {book.fileName && (
                      <button
                        onClick={() =>
                          downloadFile(
                            book.fileName!,
                            book.fileData,
                            book.fileType
                          )
                        }
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer"
                        title={`Download ${book.fileName}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-1">
                    {book.status === 'Available' ? (
                      <button
                        onClick={() => setBorrowingBook(book)}
                        className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        Borrow
                      </button>
                    ) : (
                      <button
                        onClick={() => returnBook(book.id)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                      >
                        Return
                      </button>
                    )}

                    {isStaffOrAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(book)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Edit Book Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingBook(book)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/40 dark:bg-purple-950/20 border-b border-purple-100/50 dark:border-purple-900/40 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 pl-6 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedBookIds.length === paginatedBooks.length &&
                        paginatedBooks.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Book Title & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Publication Info</th>
                  <th className="py-3 px-4">Digital File</th>
                  <th className="py-3 px-4">Status & Copies</th>
                  <th className="py-3 px-4 text-center">Save</th>
                  <th className="py-3 px-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {paginatedBooks.map((book) => {
                  const isSelected = selectedBookIds.includes(book.id);
                  const catColors =
                    CATEGORY_COLORS[book.category] || CATEGORY_COLORS['Other'];

                  return (
                    <tr
                      key={book.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-purple-50/40 dark:bg-purple-950/30'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
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

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setDetailBook(book)}
                            className="w-10 h-10 rounded-xl overflow-hidden bg-purple-900 shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer flex items-center justify-center text-white text-xs font-bold"
                          >
                            {book.coverImage && book.coverImage.trim() !== '' ? (
                              <img
                                src={book.coverImage}
                                alt={book.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{book.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span
                              onClick={() => setDetailBook(book)}
                              className="font-bold text-slate-900 dark:text-white block hover:text-purple-600 cursor-pointer"
                            >
                              {book.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              By {book.writer} • ID: {book.bookId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                        >
                          {book.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {book.language || 'English'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate max-w-[140px]">
                            {book.publisher || 'Academic Press'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {book.publishDate} • {book.pages || 320}p
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {book.fileName ? (
                          <button
                            onClick={() =>
                              downloadFile(
                                book.fileName!,
                                book.fileData,
                                book.fileType
                              )
                            }
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span className="uppercase">
                              {book.fileType || 'PDF'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({book.fileSize || '3.2 MB'})
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Physical Copy
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            book.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {book.status} ({book.availableCopies}/
                          {book.totalCopies})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleFavoriteBook(book.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title={
                            book.isFavorite
                              ? 'Remove from Favorites'
                              : 'Add to Favorites'
                          }
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              book.isFavorite
                                ? 'fill-rose-500 text-rose-500'
                                : ''
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReadingBook(book)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Read
                          </button>

                          <button
                            onClick={() => setDetailBook(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Specs"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {book.status === 'Available' ? (
                            <button
                              onClick={() => setBorrowingBook(book)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                            >
                              Borrow
                            </button>
                          ) : (
                            <button
                              onClick={() => returnBook(book.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                            >
                              Return
                            </button>
                          )}

                          {isStaffOrAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(book)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Edit Book"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingBook(book)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Book"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredBooks.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Book Specifications & Details Modal */}
      {detailBook && (
        <Modal
          isOpen={!!detailBook}
          onClose={() => setDetailBook(null)}
          title="Book Catalog Details"
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Header Hero */}
            <div className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
              <div className="w-28 h-40 rounded-xl overflow-hidden bg-purple-900 shrink-0 shadow-md">
                {detailBook.coverImage && detailBook.coverImage.trim() !== '' ? (
                  <img
                    src={detailBook.coverImage}
                    alt={detailBook.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                    {detailBook.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800">
                      {detailBook.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>{detailBook.language || 'English'}</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                        detailBook.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {detailBook.status} ({detailBook.availableCopies}/
                      {detailBook.totalCopies} Available)
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {detailBook.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    By <span className="font-bold text-slate-700 dark:text-slate-200">{detailBook.writer}</span> • Catalog ID: {detailBook.bookId}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => {
                      setReadingBook(detailBook);
                      setDetailBook(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Reader & Synopsis</span>
                  </button>

                  {detailBook.fileName && (
                    <button
                      onClick={() =>
                        downloadFile(
                          detailBook.fileName!,
                          detailBook.fileData,
                          detailBook.fileType
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Attachment</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleFavoriteBook(detailBook.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      detailBook.isFavorite
                        ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800'
                        : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400'
                    }`}
                    title={
                      detailBook.isFavorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        detailBook.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Synopsis / Description */}
            {detailBook.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Book Synopsis & Overview
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {detailBook.description}
                </p>
              </div>
            )}

            {/* Publication Specifications Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Publication Specifications & Metadata
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Publisher
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {detailBook.publisher || 'Oxford University Press'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Publication Year
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {detailBook.publishDate || '2023'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    ISBN Number
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                    {detailBook.isbn || '978-0-14-143951-8'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Edition / Print
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {detailBook.edition || '1st Global Edition'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Page Count
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {detailBook.pages || 340} Pages
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Uploaded To Catalog
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {detailBook.uploadedAt || '2026-01-15'}
                  </span>
                </div>
              </div>
            </div>

            {/* Attached File Banner if available */}
            {detailBook.fileName && (
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {detailBook.fileName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Digital Document Attachment • {detailBook.fileSize || '3.5 MB'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      detailBook.fileName!,
                      detailBook.fileData,
                      detailBook.fileType
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Book Reader / Interactive Document Preview Modal */}
      {readingBook && (
        <Modal
          isOpen={!!readingBook}
          onClose={() => setReadingBook(null)}
          title={`Reading: ${readingBook.name}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                  {readingBook.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  By {readingBook.writer}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme toggles */}
                <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                  <button
                    onClick={() => setReaderTheme('light')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      readerTheme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setReaderTheme('sepia')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      readerTheme === 'sepia'
                        ? 'bg-[#fbf0d9] text-[#5f4b32] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReaderTheme('dark')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      readerTheme === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                </div>

                {/* Font Size controls */}
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-xl text-xs">
                  <button
                    onClick={() =>
                      setReaderFontSize((s) => Math.max(12, s - 1))
                    }
                    className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    title="Decrease Font Size"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold px-1">{readerFontSize}px</span>
                  <button
                    onClick={() =>
                      setReaderFontSize((s) => Math.min(22, s + 1))
                    }
                    className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    title="Increase Font Size"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Copy Text */}
                <button
                  onClick={handleCopyReaderText}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                  title="Copy Text Content"
                >
                  {copiedText ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Download */}
                {readingBook.fileName && (
                  <button
                    onClick={() =>
                      downloadFile(
                        readingBook.fileName!,
                        readingBook.fileData,
                        readingBook.fileType
                      )
                    }
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                    title="Download Complete File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reading Content Canvas */}
            <div
              style={{ fontSize: `${readerFontSize}px` }}
              className={`p-6 rounded-2xl border min-h-[320px] max-h-[500px] overflow-y-auto leading-relaxed transition-all font-serif ${
                readerTheme === 'light'
                  ? 'bg-white text-slate-800 border-slate-200'
                  : readerTheme === 'sepia'
                  ? 'bg-[#fdf6e2] text-[#433422] border-[#ecd8b0]'
                  : 'bg-slate-900 text-slate-200 border-slate-800'
              }`}
            >
              {readingBook.fileData ? (
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed">
                  {readingBook.fileData}
                </div>
              ) : (
                <div className="space-y-4 font-sans">
                  <h3 className="text-base font-bold">
                    {readingBook.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic">
                    By {readingBook.writer} • Category: {readingBook.category}
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {readingBook.description ||
                      'This book is part of the Audienta General Knowledge Library collection. Physical copy is available for borrowing at the campus learning center.'}
                  </p>
                  <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
                    <p className="font-bold text-purple-900 dark:text-purple-200">
                      Catalog Record Note:
                    </p>
                    <p className="text-purple-700 dark:text-purple-300 mt-1">
                      Full digital edition is synced with library catalog ID {readingBook.bookId}. ISBN: {readingBook.isbn || 'N/A'}. Published by {readingBook.publisher || 'Academic Press'}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBook ? 'Edit Book Record' : 'Add Book to General Catalog'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Sapiens: A Brief History of Humankind"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Author / Writer *
              </label>
              <input
                type="text"
                required
                value={formData.writer}
                onChange={(e) =>
                  setFormData({ ...formData, writer: e.target.value })
                }
                placeholder="e.g. Yuval Noah Harari"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                General Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as BookCategory })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                {BOOK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Arabic">Arabic</option>
                <option value="Swahili">Swahili</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Publish Year
              </label>
              <input
                type="text"
                value={formData.publishDate}
                onChange={(e) =>
                  setFormData({ ...formData, publishDate: e.target.value })
                }
                placeholder="2024"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Total Copies
              </label>
              <input
                type="number"
                min={1}
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="Oxford Academic"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                ISBN Number
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="978-0-12-345678-9"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Page Count
              </label>
              <input
                type="number"
                min={10}
                value={formData.pages}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pages: parseInt(e.target.value) || 200,
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Book Synopsis / Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Exploration of human progress, cognitive development, economic evolution, and historical impact..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Cover image selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Select Book Cover Image
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {COVER_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() =>
                    setFormData({ ...formData, coverImage: preset })
                  }
                  className={`w-12 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    formData.coverImage === preset
                      ? 'border-purple-600 ring-2 ring-purple-500/30 scale-105'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  {preset && preset.trim() !== '' ? (
                    <img
                      src={preset}
                      alt="cover preset"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Dropzone */}
          <FileUploadDropzone
            label="Attach E-Book / Digital PDF / Word Document (Optional)"
            currentFile={formData.file}
            onFileSelected={(file) => setFormData({ ...formData, file })}
            onFileRemoved={() => setFormData({ ...formData, file: null })}
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20 mt-2 cursor-pointer"
          >
            {editingBook ? 'Save Book Updates' : 'Add Book to Catalog'}
          </button>
        </form>
      </Modal>

      {/* Borrow Modal */}
      {borrowingBook && (
        <Modal
          isOpen={!!borrowingBook}
          onClose={() => setBorrowingBook(null)}
          title={`Borrow "${borrowingBook.name}"`}
          maxWidth="sm"
        >
          <form onSubmit={handleBorrowSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Catalog ID: <span className="font-bold text-slate-900 dark:text-white">{borrowingBook.bookId}</span> | Category: {borrowingBook.category}
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Borrower Name
              </label>
              <input
                type="text"
                required
                value={borrowerNameInput}
                onChange={(e) => setBorrowerNameInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Standard borrowing duration: 14 days. You can return the book at any time from this portal.
            </p>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-purple-600/20"
            >
              Confirm Borrow
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingBook && (
        <Modal
          isOpen={!!deletingBook}
          onClose={() => setDeletingBook(null)}
          title="Delete Library Book"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-white">{deletingBook.name}</span> ({deletingBook.bookId}) from the general knowledge catalog?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingBook(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteBook(deletingBook.id);
                setDeletingBook(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
