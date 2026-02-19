import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  OffcanvasTitle,
} from 'react-bootstrap'
import { TbCornerDownRight, TbEdit, TbTrash } from 'react-icons/tb'

import FileUploader from '@/components/FileUploader'
import type { Comment } from '@/types/entity'

type FeedReply = {
  id: number
  user_id: number
  content: string
  is_anonymous: boolean
  created_at: Date
  attachments?: string[]
}

export type FeedComment = Comment & {
  replies: FeedReply[]
  attachments?: string[]
}

type IdeaCommentsDrawerProps = {
  show: boolean
  onHide: () => void
  comments: FeedComment[]
  currentUserId: number
  onAddComment: (
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => void
  onEditComment: (commentId: number, content: string) => void
  onDeleteComment: (commentId: number) => void
  onReply: (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => void
}

const IdeaCommentsDrawer = ({
  show,
  onHide,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReply,
}: IdeaCommentsDrawerProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentAnonymous, setCommentAnonymous] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentFiles, setCommentFiles] = useState<File[] | undefined>([])

  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyAnonymous, setReplyAnonymous] = useState(false)
  const [replyFiles, setReplyFiles] = useState<File[] | undefined>([])

  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime(),
      ),
    [comments],
  )

  useEffect(() => {
    if (!show) {
      setShowAddForm(false)
      setCommentText('')
      setCommentAnonymous(false)
      setCommentError('')
      setCommentFiles([])
      setReplyTargetId(null)
      setReplyText('')
      setReplyAnonymous(false)
      setReplyFiles([])
      setEditTargetId(null)
      setEditText('')
    }
  }, [show])

  const handleSubmitComment = () => {
    if (commentText.trim().length < 3) {
      setCommentError('Comment is required')
      return
    }
    onAddComment(commentText.trim(), commentAnonymous, commentFiles)
    setShowAddForm(false)
    setCommentText('')
    setCommentAnonymous(false)
    setCommentError('')
    setCommentFiles([])
  }

  const handleStartReply = (commentId: number) => {
    setReplyTargetId(commentId)
    setReplyText('')
    setReplyAnonymous(false)
    setReplyFiles([])
  }

  const handleSubmitReply = (commentId: number) => {
    if (replyText.trim().length < 3) return
    onReply(commentId, replyText.trim(), replyAnonymous, replyFiles)
    setReplyTargetId(null)
    setReplyText('')
    setReplyAnonymous(false)
    setReplyFiles([])
  }

  const handleStartEdit = (comment: FeedComment) => {
    setEditTargetId(comment.id as number)
    setEditText(comment.content)
  }

  const handleSubmitEdit = (commentId: number) => {
    if (editText.trim().length < 3) return
    onEditComment(commentId, editText.trim())
    setEditTargetId(null)
    setEditText('')
  }

  return (
    <Offcanvas placement="end" show={show} onHide={onHide} className="border-0">
      <OffcanvasHeader closeButton className="px-4">
        <OffcanvasTitle>Comments</OffcanvasTitle>
      </OffcanvasHeader>
      <OffcanvasBody className="px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="m-0">All Comments</h6>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? 'Close' : 'Add Comment'}
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-4">
            <FormGroup className="mb-3">
              <FormLabel>Comment</FormLabel>
              <FormControl
                as="textarea"
                rows={3}
                value={commentText}
                isInvalid={!!commentError}
                onChange={(event) => {
                  setCommentText(event.target.value)
                  if (commentError) setCommentError('')
                }}
              />
              {commentError && (
                <div className="invalid-feedback">{commentError}</div>
              )}
            </FormGroup>
            <FormGroup className="mb-3">
              <FormCheck
                type="checkbox"
                label="Post anonymously"
                checked={commentAnonymous}
                onChange={(event) => setCommentAnonymous(event.target.checked)}
              />
            </FormGroup>
            <FormGroup className="mb-3">
              <FormLabel>Attachments (optional)</FormLabel>
              <FileUploader
                setFiles={setCommentFiles}
                files={commentFiles}
                maxFileCount={2}
              />
            </FormGroup>
            <div className="d-flex gap-2">
              <Button variant="primary" size="sm" onClick={handleSubmitComment}>
                Submit Comment
              </Button>
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {sortedComments.length === 0 ? (
          <p className="text-muted">No comments yet.</p>
        ) : (
          sortedComments.map((comment) => {
            const isOwner = comment.user_id === currentUserId
            return (
              <div key={comment.id} className="border rounded-3 p-3 mb-4">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="fw-semibold">
                      {comment.is_anonymous
                        ? 'Anonymous'
                        : `User #${comment.user_id}`}
                    </div>
                    <div className="text-muted fs-xxs">
                      {comment.created_at.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {isOwner && (
                      <>
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-icon"
                          onClick={() => handleStartEdit(comment)}
                        >
                          <TbEdit />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-icon text-danger"
                          onClick={() => {
                            if (window.confirm('Delete this comment?')) {
                              onDeleteComment(comment.id as number)
                            }
                          }}
                        >
                          <TbTrash />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="light"
                      size="sm"
                      className="btn-icon"
                      onClick={() => handleStartReply(comment.id as number)}
                    >
                      <TbCornerDownRight />
                    </Button>
                  </div>
                </div>

                {editTargetId === comment.id ? (
                  <div className="mt-3">
                    <FormGroup className="mb-2">
                      <FormLabel>Edit comment</FormLabel>
                      <FormControl
                        as="textarea"
                        rows={3}
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                      />
                    </FormGroup>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitEdit(comment.id as number)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setEditTargetId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted mt-2">{comment.content}</div>
                )}

                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="text-muted fs-xxs mt-2">
                    Attachments: {comment.attachments.join(', ')}
                  </div>
                )}

                {comment.replies.length > 0 && (
                  <div className="mt-4 ps-3 border-start">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="border rounded-3 p-2 mb-3">
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">
                            {reply.is_anonymous
                              ? 'Anonymous'
                              : `User #${reply.user_id}`}
                          </span>
                          <span className="text-muted fs-xxs">
                            {reply.created_at.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-muted mt-1">{reply.content}</div>
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="text-muted fs-xxs mt-2">
                            Attachments: {reply.attachments.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {replyTargetId === comment.id && (
                  <div className="mt-4">
                    <FormGroup className="mb-2">
                      <FormLabel>Reply</FormLabel>
                      <FormControl
                        as="textarea"
                        rows={2}
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <FormLabel>Attachments (optional)</FormLabel>
                      <FileUploader
                        setFiles={setReplyFiles}
                        files={replyFiles}
                        maxFileCount={2}
                      />
                    </FormGroup>
                    <FormGroup className="mb-3">
                      <FormCheck
                        type="checkbox"
                        label="Reply anonymously"
                        checked={replyAnonymous}
                        onChange={(event) =>
                          setReplyAnonymous(event.target.checked)
                        }
                      />
                    </FormGroup>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id as number)}
                      >
                        Submit Reply
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setReplyTargetId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </OffcanvasBody>
    </Offcanvas>
  )
}

export default IdeaCommentsDrawer
