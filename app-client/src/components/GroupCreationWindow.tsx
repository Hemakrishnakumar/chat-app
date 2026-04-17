import { useState, useEffect, useRef } from 'react';
import { X, Search, Check } from 'lucide-react';
import { userService, type SearchUser } from '@/services/user.service';
import { useAuth } from '@/context';
import { useConversation } from '@/context/conversationContext';

interface GroupCreationWindowProps {
  onClose: () => void;
}

const GroupCreationWindow = ({ onClose }: GroupCreationWindowProps) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { addDraftConversation } = useConversation();
  const [selectedMembers, setSelectedMembers] = useState<SearchUser[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search for users
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await userService.searchUsers(searchQuery);
        // Filter out current user and already selected members
        const filtered = response.data.filter(
          (u: SearchUser) => u.id !== user?.id && !selectedMembers.find((m) => m.id === u.id)
        );
        setSearchResults(filtered);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedMembers, user?.id]);

  const handleSelectMember = (member: SearchUser) => {
    setSelectedMembers((prev) => [...prev, member]);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert('Please enter a group name and select at least 2 members');
      return;
    }
    // TODO: Implement group creation API call
    addDraftConversation({ ids: selectedMembers.map(mem=>mem.id), name: groupName, type: 'group'})
    onClose();
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 text-sm md:text-base">Create Group</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
        {/* Group Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="w-full px-3 md:px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Member Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Members
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectMember(result)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                      {result.photo_url ? (
                        <img
                          src={result.photo_url}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{result.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Members ({selectedMembers.length})
            </label>
            <div className="space-y-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 overflow-hidden">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{member.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length < 2}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={16} />
          Create Group
        </button>
      </div>
    </div>
  );
};

export default GroupCreationWindow;
