'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormCheck,
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
  Row,
  Spinner,
} from 'react-bootstrap'
import {
  TbDownload,
  TbEdit,
  TbFileDescription,
  TbMessageDots,
  TbThumbDown,
  TbThumbUp,
  TbTrash,
} from 'react-icons/tb'

import DashboardPage from '@/components/common/DashboardPage'
import IdeaCommentsDrawer, {
  type FeedComment,
} from '@/pages/idea/components/IdeaCommentsDrawer'
import { useAcademicYearStore } from '../master/academic-year/store'
import { useIdeaStore, useIdeaSpecificStore } from './store'
import { useIdeaCategoryStore } from '../master/idea-category/store'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import Can from '@/components/Can'

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

export const IdeaFeedsPage = () => {
  const [activeIdea, setActiveIdea] = useState<any | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showYearModal, setShowYearModal] = useState(false)
  const [comments, setComments] = useState<FeedComment[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)

  const { fetchAll: fetchYears, items: academicYears } = useAcademicYearStore()
  const { items: categories, fetchAll: fetchCategories } =
    useIdeaCategoryStore()
  const {
    commentFiles,
    setCommentFiles,
    replyFiles,
    setReplyFiles,
    setFormValues,
  } = useIdeaSpecificStore()

  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)

  const ideaStore = useMemo(
    () => useIdeaStore(selectedYearId ? String(selectedYearId) : ''),
    [selectedYearId],
  )

  const {
    items: ideas,
    fetchAll: fetchIdeas,
    isLoading: isIdeasLoading,
  } = ideaStore()

  useEffect(() => {
    fetchYears()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchIdeas()
  }, [selectedYearId])

  useEffect(() => {
    console.log('🚀 ~ IdeaFeedsPage ~ academicYears:', academicYears)
    if (academicYears.length > 0 && !selectedYearId) {
      setSelectedYearId(
        (academicYears.find((data: any) => data.is_active === 1)?.id ??
          1) as number,
      )
    }
  }, [academicYears])

  const handleReaction = async (
    ideaId: number,
    type: 'thumbs_up' | 'thumbs_down',
    item: any,
  ) => {
    try {
      if (item.my_reaction === 'thumbs_up') {
        await axios.delete(`/ideas/${ideaId}/reactions`)
      } else if (item.my_reaction === 'thumbs_down') {
        await axios.delete(`/ideas/${ideaId}/reactions`)
      } else {
        await axios.post(`/ideas/${ideaId}/reactions`, {
          reaction_type: type,
        })
      }

      fetchIdeas()
    } catch (error) {
      toast.error('Failed to update reaction')
    }
  }

  const uploadFile = async (files: File[] | undefined) => {
    if (!files || files.length === 0) return null
    try {
      const formData = new FormData()
      formData.append('file', files[0])
      const { data } = await axios.post('/ideas/file-upload', formData)
      return data.file_url
    } catch (error) {
      console.error('File upload failed', error)
      return null
    }
  }

  const fetchComments = async (ideaId: number) => {
    setIsCommentsLoading(true)
    try {
      const { data } = await axios.get(`/ideas/${ideaId}/comments`)
      setComments(data?.data || [])
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setIsCommentsLoading(false)
    }
  }

  const handleAddComment = async (content: string, isAnonymous: boolean) => {
    if (!activeIdea) return
    try {
      const fileUrl = await uploadFile(commentFiles)

      await axios.post(`/ideas/${activeIdea.id}/comments`, {
        content,
        is_annonymous: isAnonymous,
        file_url: fileUrl,
      })
      toast.success('Comment added')
      setCommentFiles([])
      fetchComments(activeIdea.id)
    } catch (error) {
      toast.error('Failed to post comment')
    }
  }

  const handleReply = async (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => {
    if (!activeIdea) return
    try {
      const fileUrl = await uploadFile(replyFiles)

      await axios.post(`/ideas/${activeIdea.id}/comments`, {
        content,
        is_annonymous: isAnonymous,
        replied_comment_id: commentId,
        file_url: fileUrl,
      })
      toast.success('Reply posted')
      setReplyFiles([]) // Clear store files
      fetchComments(activeIdea.id)
    } catch (error) {
      toast.error('Failed to post reply')
    }
  }

  const handleEditComment = async (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    files: File[] | undefined,
  ) => {
    if (!activeIdea) return

    try {
      let fileUrl = null

      if (files && files.length > 0) {
        const isNewFile = !(files[0] as any).isExisting

        if (isNewFile) {
          const formData = new FormData()
          formData.append('file', files[0])
          const uploadRes = await axios.post(`/ideas/file-upload`, formData)
          fileUrl = uploadRes.data.file_url
        } else {
          fileUrl = (files[0] as any).preview
        }
      }

      await axios.patch(`/comments/${commentId}`, {
        content,
        is_annonymous: isAnonymous,
        file_url: fileUrl,
      })

      toast.success('Comment updated')

      setCommentFiles([])
      fetchComments(activeIdea.id)
    } catch (error) {
      console.error('Edit failed:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!activeIdea) return
    try {
      await axios.delete(`/comments/${commentId}`)
      toast.success('Comment deleted')
      fetchComments(activeIdea.id)
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleOpenComments = (idea: any) => {
    setFormValues(idea)
    setActiveIdea(idea)
    fetchComments(idea.id)
    setShowComments(true)
  }

  const selectedYearName = useMemo(
    () =>
      academicYears.find((y) => y.id === selectedYearId)?.name || 'Select Year',
    [academicYears, selectedYearId],
  )

  return (
    <Container fluid>
      <DashboardPage title="Idea Feeds" subtitle="Community">
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded">
          <h5 className="mb-0">
            Showing Ideas for: <strong>{selectedYearName}</strong>
          </h5>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowYearModal(true)}
          >
            Switch Academic Year
          </Button>
        </div>

        {isIdeasLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row className="justify-content-center">
            <Col xl={8} lg={10}>
              {ideas.length === 0 && (
                <div className="text-center text-muted">No ideas found.</div>
              )}
              <div className="d-grid gap-4">
                {ideas.map((item: any) => {
                  return (
                    <Card key={item.id} className="border shadow-sm">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge
                            bg="primary-subtle"
                            className="text-primary m-0"
                          >
                            {item.idea_category || 'General'}
                          </Badge>
                        </div>

                        <h4 className="mb-2">{item.title}</h4>
                        <p className="text-secondary">{item.content}</p>
                        <AttachmentPreview url={item.file_url} />
                        <hr className="my-3 opacity-25" />
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap gap-3 text-muted fs-xxs">
                            <span>Comments: {item.comments_count}</span>
                            <span>
                              Submitted:{' '}
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex gap-3 text-muted small">
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                handleReaction(item.id, 'thumbs_up', item)
                              }
                            >
                              <TbThumbUp
                                className={`${item.my_reaction === 'thumbs_up' ? 'text-success' : ''}`}
                              />{' '}
                              {item.thumbs_up || 0}
                            </span>
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                handleReaction(item.id, 'thumbs_down', item)
                              }
                            >
                              <TbThumbDown
                                className={`${item.my_reaction === 'thumbs_down' ? 'text-danger' : ''}`}
                              />{' '}
                              {item.thumbs_down || 0}
                            </span>
                          </div>
                          <Can perform="comment.view">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="ms-auto d-inline-flex align-items-center gap-1"
                              onClick={() => handleOpenComments(item)}
                            >
                              <TbMessageDots />
                              Comments
                            </Button>
                          </Can>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            </Col>
          </Row>
        )}
      </DashboardPage>

      {/* Year Modal */}
      <Modal
        show={showYearModal}
        onHide={() => setShowYearModal(false)}
        centered
      >
        <ModalHeader closeButton>
          <ModalTitle>Academic Year</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {academicYears.map((year) => (
            <FormGroup
              key={year.id}
              className="mb-2 p-2 rounded cursor-pointer"
            >
              <FormCheck
                type="radio"
                name="academicYear"
                id={`year-${year.id}`}
                label={year.name}
                checked={selectedYearId === year.id}
                onChange={() => {
                  setSelectedYearId(year.id as number)
                  setShowYearModal(false)
                }}
              />
            </FormGroup>
          ))}
        </ModalBody>
      </Modal>

      {/* Drawer */}
      <IdeaCommentsDrawer
        show={showComments}
        isLoading={isCommentsLoading}
        onHide={() => {
          setShowComments(false)
          setActiveIdea(null)
          setComments([])
          setCommentFiles([]) // Clear global files
          setReplyFiles([])
        }}
        comments={comments}
        currentUserId={JSON.parse(localStorage.getItem('token')!)?.user.id}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onReply={handleReply}
      />
    </Container>
  )
}

export default IdeaFeedsPage
