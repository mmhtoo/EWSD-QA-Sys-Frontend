'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  FormCheck,
  FormControl,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  OffcanvasTitle,
  Spinner,
  FormLabel,
  Card,
  CardBody,
  Badge,
  Dropdown,
  Form,
  FormGroup,
  Row,
  Col,
} from 'react-bootstrap'
import {
  TbCornerDownRight,
  TbEdit,
  TbTrash,
  TbPaperclip,
  TbDownload,
  TbFileDescription,
  TbDotsVertical,
} from 'react-icons/tb'

import FileUploader from '@/components/FileUploader'
import type { Comment } from '@/types/entity'
import { useIdeaSpecificStore, useReportStore } from '../store'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import EntityFormModal from '@/components/common/EntityFormModal'
import { useReportCategoryStore } from '@/pages/master/report-category/store'
import ApiHandlingProvider from '@/utils/ApiHandleProvider'
import toast from 'react-hot-toast'

export type FeedComment = Comment & {
  replies?: FeedComment[]
  attachments?: string[]
  file_url?: string | null
  is_annonymous?: number | boolean
  replied_comment_id?: number | null
  user_info?: {
    id: number | null
    name: string
    email?: string
  }
}

type IdeaCommentsDrawerProps = {
  show: boolean
  onHide: () => void
  isLoading?: boolean
  comments: FeedComment[]
  currentUserId: number
  onAddComment: (
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => void
  onEditComment: (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => void
  onDeleteComment: (commentId: number) => void
  onReply: (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => void
}

const AttachmentPreview = ({ url }: { url?: string | null }) => {
  if (!url) return null
  return (
    <div className="mt-2 d-inline-block">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex align-items-center gap-1 p-1 px-2 rounded bg-primary-subtle text-primary text-decoration-none border border-primary-subtle"
        style={{ fontSize: '11px' }}
      >
        <TbFileDescription size={14} />
        <span className="text-truncate" style={{ maxWidth: '150px' }}>
          View Attachment
        </span>
        <TbDownload size={12} className="ms-1" />
      </a>
    </div>
  )
}

const IdeaCommentsDrawer = ({
  show,
  onHide,
  isLoading,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReply,
}: IdeaCommentsDrawerProps) => {
  const { create, setPayload, isLoading: isLoadingReport } = useReportStore()

  const {
    items,
    fetchAll,
    isLoading: isLoadingReportCategories,
  } = useReportCategoryStore()

  const {
    formValues,
    commentFiles,
    setCommentFiles,
    replyFiles,
    setReplyFiles,
  } = useIdeaSpecificStore()

  // --- Modal States ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [targetDeleteId, setTargetDeleteId] = useState<number | null>(null)

  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState<'comment' | 'user' | null>(null)
  const [reportTargetId, setReportTargetId] = useState<number | null>(null)
  const [reportCategory, setReportCategory] = useState('')
  const [reportReason, setReportReason] = useState('')

  // --- Form Input States ---
  const [showAddForm, setShowAddForm] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentAnonymous, setCommentAnonymous] = useState(false)
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyAnonymous, setReplyAnonymous] = useState(false)
  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editAnonymous, setEditAnonymous] = useState(false)

  // --- Tree Logic ---
  const mainComments = useMemo(() => {
    if (!comments || !Array.isArray(comments)) return []
    const map: Record<number, FeedComment> = {}
    const roots: FeedComment[] = []
    comments.forEach((c) => {
      map[c.id as number] = { ...c, replies: [] }
    })
    comments.forEach((c) => {
      const current = map[c.id as number]
      if (c.replied_comment_id && map[c.replied_comment_id]) {
        map[c.replied_comment_id].replies?.push(current)
      } else if (!c.replied_comment_id) {
        roots.push(current)
      }
    })
    return roots.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    )
  }, [comments])

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    if (!show) {
      setShowAddForm(false)
      setReplyTargetId(null)
      setEditTargetId(null)
      setShowReportModal(false)
      setCommentFiles([])
      setReplyFiles([])
    }
  }, [show, setCommentFiles, setReplyFiles])

  // --- Handlers ---
  const openReportModal = (type: 'comment' | 'user', id: number) => {
    setReportCategory(String(items[0]?.id))
    setReportType(type)
    setReportTargetId(id)
    setShowReportModal(true)
  }

  const handleReportSubmit = async () => {
    if (reportType === 'comment') {
      setPayload({
        idea_id: formValues.id,
        comment_id: reportTargetId,
        category_id: Number(reportCategory),
        reason: reportReason,
      })
      await create()
    } else if (reportType === 'user') {
      setPayload({
        idea_id: formValues.id,
        user_id: reportTargetId,
        category_id: Number(reportCategory),
        reason: reportReason,
      })
      await create()
    } else {
      toast.error('Something wrong.')
    }

    setShowReportModal(false)
    setReportCategory('')
    setReportReason('')
  }

  const promptDelete = (id: number) => {
    setTargetDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (targetDeleteId) {
      onDeleteComment(targetDeleteId)
      setShowDeleteModal(false)
      setTargetDeleteId(null)
    }
  }

  const handleSubmitReply = (parentId: number) => {
    if (replyText.trim().length < 3) return
    onReply(parentId, replyText, replyAnonymous, replyFiles)
    setReplyTargetId(null)
    setReplyText('')
    setReplyFiles([])
    setReplyAnonymous(false)
  }

  return (
    <>
      <Offcanvas
        placement="end"
        show={show}
        onHide={onHide}
        style={{ width: '450px' }}
        className="border-0 shadow-lg"
      >
        <OffcanvasHeader closeButton className="px-4 border-bottom">
          <OffcanvasTitle>Idea Details</OffcanvasTitle>
        </OffcanvasHeader>
        <ApiHandlingProvider apiCalls={[isLoadingReportCategories]}>
          <Card key={formValues.id} className="border shadow-sm m-4">
            <CardBody>
              <Badge bg="primary-subtle" className="text-primary mb-2">
                {formValues.idea_category || 'General'}
              </Badge>
              <h4 className="mb-2">{formValues.title}</h4>
              <p className="text-secondary small">{formValues.content}</p>
            </CardBody>
          </Card>

          <OffcanvasBody className="px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="m-0 fw-bold text-muted">Discussion</h6>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : 'Add Comment'}
              </Button>
            </div>

            {/* ADD COMMENT FORM */}
            {showAddForm && (
              <div className="mb-4 p-3 border rounded bg-light">
                <FormControl
                  as="textarea"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="mb-2"
                />
                <FormCheck
                  type="checkbox"
                  label="Post anonymously"
                  checked={commentAnonymous}
                  onChange={(e) => setCommentAnonymous(e.target.checked)}
                  className="mb-2 small"
                />
                <FileUploader
                  setFiles={setCommentFiles}
                  files={commentFiles}
                  maxFileCount={1}
                />
                <Button
                  className="w-100 mt-2"
                  onClick={() => {
                    onAddComment(commentText, commentAnonymous, commentFiles)
                    setShowAddForm(false)
                    setCommentText('')
                  }}
                >
                  Post Comment
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            ) : (
              mainComments.map((comment) => {
                const isOwner = comment.user_id === currentUserId
                const isEditing = editTargetId === comment.id

                return (
                  <div key={comment.id} className="mb-4 pb-3 border-bottom">
                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold small">
                          {comment.is_annonymous || !comment.user_info?.id
                            ? 'Anonymous'
                            : comment.user_info.name}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: '10px' }}
                        >
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        {isOwner && !isEditing && (
                          <>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-primary"
                              onClick={() => {
                                setEditTargetId(comment.id as number)
                                setEditText(comment.content)
                                setEditAnonymous(!!comment.is_annonymous)
                              }}
                            >
                              <TbEdit size={16} />
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-danger"
                              onClick={() => promptDelete(comment.id as number)}
                            >
                              <TbTrash size={16} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-primary"
                          onClick={() => setReplyTargetId(comment.id as number)}
                        >
                          <TbCornerDownRight size={16} />
                        </Button>

                        <Dropdown align="end">
                          <Dropdown.Toggle
                            as="div"
                            role="button"
                            className="p-0 text-muted border-0 shadow-none d-flex"
                            style={{ cursor: 'pointer' }}
                          >
                            <TbDotsVertical size={18} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="shadow-sm border-light">
                            <Dropdown.Item
                              className="small text-danger"
                              onClick={() =>
                                openReportModal('comment', comment.id as number)
                              }
                            >
                              Report comment
                            </Dropdown.Item>
                            <Dropdown.Item
                              className="small text-danger"
                              onClick={() =>
                                openReportModal(
                                  'user',
                                  comment.user_id as number,
                                )
                              }
                            >
                              Report user
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>

                    {/* EDIT OR CONTENT */}
                    {isEditing ? (
                      <div className="mt-2 p-2 border rounded bg-white">
                        <FormControl
                          as="textarea"
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="mb-2 small"
                        />
                        <FormCheck
                          type="checkbox"
                          label="Anonymous"
                          checked={editAnonymous}
                          onChange={(e) => setEditAnonymous(e.target.checked)}
                          className="small mb-2"
                        />
                        <FileUploader
                          setFiles={setCommentFiles}
                          files={commentFiles}
                          maxFileCount={1}
                        />
                        <div className="d-flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              onEditComment(
                                comment.id as number,
                                editText,
                                editAnonymous,
                                commentFiles,
                              )
                              setEditTargetId(null)
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => setEditTargetId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="small text-dark">{comment.content}</div>
                        <AttachmentPreview url={comment.file_url} />
                      </div>
                    )}

                    {/* REPLIES */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ps-3 border-start border-2 border-light">
                        {comment.replies.map((reply) => {
                          const isReplyOwner = reply.user_id === currentUserId
                          const isEditingReply = editTargetId === reply.id
                          return (
                            <div
                              key={reply.id}
                              className="mb-2 p-2 bg-light rounded small"
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div
                                  className="fw-bold"
                                  style={{ fontSize: '11px' }}
                                >
                                  {reply.is_annonymous || !reply.user_info?.id
                                    ? 'Anonymous'
                                    : reply.user_info.name}
                                </div>
                                <div className="d-flex gap-1 align-items-center">
                                  {isReplyOwner && !isEditingReply && (
                                    <>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-primary"
                                        onClick={() => {
                                          setEditTargetId(reply.id as number)
                                          setEditText(reply.content)
                                          setEditAnonymous(
                                            !!reply.is_annonymous,
                                          )
                                        }}
                                      >
                                        <TbEdit size={14} />
                                      </Button>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 text-danger"
                                        onClick={() =>
                                          promptDelete(reply.id as number)
                                        }
                                      >
                                        <TbTrash size={14} />
                                      </Button>
                                    </>
                                  )}
                                  <Dropdown align="end">
                                    <Dropdown.Toggle
                                      as="div"
                                      role="button"
                                      className="p-0 text-muted border-0 shadow-none d-flex"
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <TbDotsVertical size={16} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="shadow-sm border-light">
                                      <Dropdown.Item
                                        className="small text-danger"
                                        onClick={() =>
                                          openReportModal(
                                            'comment',
                                            reply.id as number,
                                          )
                                        }
                                      >
                                        Report reply
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        className="small text-danger"
                                        onClick={() =>
                                          openReportModal(
                                            'user',
                                            reply.user_id as number,
                                          )
                                        }
                                      >
                                        Report user
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </div>
                              {isEditingReply ? (
                                <div className="mt-2">
                                  <FormControl
                                    as="textarea"
                                    rows={2}
                                    value={editText}
                                    onChange={(e) =>
                                      setEditText(e.target.value)
                                    }
                                    className="mb-1 small"
                                  />
                                  <div className="d-flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        onEditComment(
                                          reply.id as number,
                                          editText,
                                          editAnonymous,
                                          commentFiles,
                                        )
                                        setEditTargetId(null)
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="light"
                                      onClick={() => setEditTargetId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-secondary mt-1">
                                  {reply.content}
                                </div>
                              )}
                              <AttachmentPreview url={reply.file_url} />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* REPLY INPUT */}
                    {replyTargetId === comment.id && (
                      <div className="mt-3 ps-3 border-start border-2 border-primary-subtle">
                        <FormControl
                          as="textarea"
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="small mb-2"
                          placeholder="Write a reply..."
                        />
                        <FormCheck
                          type="checkbox"
                          label="Reply anonymously"
                          checked={replyAnonymous}
                          onChange={(e) => setReplyAnonymous(e.target.checked)}
                          className="mb-2 small"
                        />
                        <FileUploader
                          setFiles={setReplyFiles}
                          files={replyFiles}
                          maxFileCount={1}
                        />
                        <div className="d-flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSubmitReply(comment.id as number)
                            }
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => {
                              setReplyTargetId(null)
                              setReplyFiles([])
                            }}
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
        </ApiHandlingProvider>
      </Offcanvas>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        selectedCount={1}
        itemName="comment"
      />

      <EntityFormModal
        show={showReportModal}
        title={reportType === 'comment' ? 'Report Comment' : 'Report User'}
        onHide={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        submitLabel="Submit Report"
        isSubmitting={isLoadingReport}
      >
        <Form>
          <Row>
            <Col md={12}>
              <FormGroup className="mb-3">
                <FormLabel>Report Category</FormLabel>
                <Form.Select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {items?.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>
            </Col>
            <Col md={12}>
              <FormGroup className="mb-3">
                <FormLabel>Reason</FormLabel>
                <FormControl
                  as="textarea"
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Provide additional context..."
                />
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </EntityFormModal>
    </>
  )
}

export default IdeaCommentsDrawer
