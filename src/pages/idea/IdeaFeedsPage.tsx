import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Row,
} from 'react-bootstrap'
import {
  TbEdit,
  TbMessageDots,
  TbThumbDown,
  TbThumbUp,
  TbTrash,
} from 'react-icons/tb'

import DashboardPage from '@/components/common/DashboardPage'
import type { AcademicYear, Idea, IdeaCategory } from '@/types/entity'
import IdeaCommentsDrawer, {
  type FeedComment,
} from '@/pages/idea/components/IdeaCommentsDrawer'

type IdeaFeedCard = {
  idea: Idea
  category: IdeaCategory
  thumbsUp: number
  thumbsDown: number
  comments: number
  views: number
}

type ReactionState = {
  up: number
  down: number
  reacted: boolean
}

const currentUserId = 99

const academicYears: AcademicYear[] = [
  {
    id: 1,
    name: '2025/2026',
    code: 'AY2526',
    description: 'Academic year 2025/2026',
    from_date: new Date('2025-09-01'),
    to_date: new Date('2026-08-31'),
    submission_deadline: new Date('2026-04-15'),
    feedback_cut_off_deadline: new Date('2026-05-30'),
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: '2026/2027',
    code: 'AY2627',
    description: 'Academic year 2026/2027',
    from_date: new Date('2026-09-01'),
    to_date: new Date('2027-08-31'),
    submission_deadline: new Date('2027-04-15'),
    feedback_cut_off_deadline: new Date('2027-05-30'),
    created_at: new Date('2026-09-01'),
  },
]

const ideaCategories: IdeaCategory[] = [
  {
    id: 1,
    name: 'Teaching & Learning',
    description: 'Classroom experience and learning outcomes',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 2,
    name: 'Campus Services',
    description: 'Facilities, services, and operations',
    created_at: new Date('2025-09-01'),
  },
  {
    id: 3,
    name: 'Student Experience',
    description: 'Clubs, support, and wellbeing',
    created_at: new Date('2025-09-01'),
  },
]

const initialIdeas: IdeaFeedCard[] = [
  {
    idea: {
      id: 101,
      user_id: 12,
      academic_year_id: 1,
      title: 'Introduce peer-led lab sessions',
      content:
        'Create peer-led lab sessions to improve engagement in first-year modules.',
      is_anonymous: false,
      created_at: new Date('2026-01-10'),
    },
    category: ideaCategories[0],
    thumbsUp: 24,
    thumbsDown: 3,
    comments: 7,
    views: 156,
  },
  {
    idea: {
      id: 102,
      user_id: 18,
      academic_year_id: 1,
      title: 'Improve shuttle bus scheduling',
      content:
        'Extend shuttle bus service during evening hours and publish real-time updates.',
      is_anonymous: true,
      created_at: new Date('2026-01-22'),
    },
    category: ideaCategories[1],
    thumbsUp: 15,
    thumbsDown: 1,
    comments: 4,
    views: 98,
  },
  {
    idea: {
      id: 103,
      user_id: 7,
      academic_year_id: 1,
      title: 'Monthly wellbeing check-ins',
      content:
        'Run monthly wellbeing check-ins with counselors and peer mentors.',
      is_anonymous: false,
      created_at: new Date('2026-02-03'),
    },
    category: ideaCategories[2],
    thumbsUp: 31,
    thumbsDown: 2,
    comments: 11,
    views: 210,
  },
]

export const IdeaFeedsPage = () => {
  const [ideas, setIdeas] = useState<IdeaFeedCard[]>(() => [...initialIdeas])
  const [activeIdea, setActiveIdea] = useState<IdeaFeedCard | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [showYearModal, setShowYearModal] = useState(false)
  const [selectedYearId, setSelectedYearId] = useState<number>(
    academicYears[0]?.id as number,
  )
  const [commentsByIdea, setCommentsByIdea] = useState<
    Record<string, FeedComment[]>
  >({
    '101': [
      {
        id: 1001,
        user_id: 44,
        idea_id: 101,
        content:
          'Great idea. It would help students feel more confident in labs.',
        is_anonymous: false,
        created_at: new Date('2026-02-01'),
        replies: [],
      },
    ],
    '102': [],
    '103': [
      {
        id: 1002,
        user_id: 29,
        idea_id: 103,
        content: 'Please include online check-ins for remote students.',
        is_anonymous: true,
        created_at: new Date('2026-02-11'),
        replies: [],
      },
    ],
  })
  const [editingIdea, setEditingIdea] = useState<IdeaFeedCard | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const [reactions, setReactions] = useState<Record<string, ReactionState>>(
    () =>
      Object.fromEntries(
        initialIdeas.map((idea) => [
          String(idea.idea.id),
          { up: idea.thumbsUp, down: idea.thumbsDown, reacted: false },
        ]),
      ),
  )

  const commentsForActiveIdea = useMemo(() => {
    if (!activeIdea) return []
    return commentsByIdea[String(activeIdea.idea.id)] ?? []
  }, [activeIdea, commentsByIdea])

  const selectedYear = useMemo(
    () => academicYears.find((year) => year.id === selectedYearId),
    [selectedYearId],
  )

  const filteredIdeas = useMemo(
    () => ideas.filter((item) => item.idea.academic_year_id === selectedYearId),
    [ideas, selectedYearId],
  )

  const openComments = (idea: IdeaFeedCard) => {
    setActiveIdea(idea)
    setShowComments(true)
  }

  const handleAddComment = (
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => {
    if (!activeIdea) return
    const newComment: FeedComment = {
      id: Date.now(),
      user_id: currentUserId,
      idea_id: activeIdea.idea.id as number,
      content,
      is_anonymous: isAnonymous,
      created_at: new Date(),
      replies: [],
      attachments: (attachments ?? []).map((file) => file.name),
    }

    setCommentsByIdea((prev) => ({
      ...prev,
      [String(activeIdea.idea.id)]: [
        newComment,
        ...(prev[String(activeIdea.idea.id)] ?? []),
      ],
    }))

    setIdeas((prev) =>
      prev.map((item) =>
        item.idea.id === activeIdea.idea.id
          ? { ...item, comments: item.comments + 1 }
          : item,
      ),
    )
  }

  const handleEditComment = (commentId: number, content: string) => {
    if (!activeIdea) return
    setCommentsByIdea((prev) => {
      const ideaKey = String(activeIdea.idea.id)
      const updated = (prev[ideaKey] ?? []).map((comment) =>
        comment.id === commentId ? { ...comment, content } : comment,
      )
      return { ...prev, [ideaKey]: updated }
    })
  }

  const handleDeleteComment = (commentId: number) => {
    if (!activeIdea) return
    setCommentsByIdea((prev) => {
      const ideaKey = String(activeIdea.idea.id)
      const updated = (prev[ideaKey] ?? []).filter(
        (comment) => comment.id !== commentId,
      )
      return { ...prev, [ideaKey]: updated }
    })

    setIdeas((prev) =>
      prev.map((item) =>
        item.idea.id === activeIdea.idea.id
          ? { ...item, comments: Math.max(item.comments - 1, 0) }
          : item,
      ),
    )
  }

  const handleReply = (
    commentId: number,
    content: string,
    isAnonymous: boolean,
    attachments: File[] | undefined,
  ) => {
    if (!activeIdea) return
    const reply = {
      id: Date.now(),
      user_id: currentUserId,
      content,
      is_anonymous: isAnonymous,
      created_at: new Date(),
      attachments: (attachments ?? []).map((file) => file.name),
    }

    setCommentsByIdea((prev) => {
      const ideaKey = String(activeIdea.idea.id)
      const updated = (prev[ideaKey] ?? []).map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      )
      return { ...prev, [ideaKey]: updated }
    })
  }

  const handleReaction = (ideaId: number, type: 'up' | 'down') => {
    setReactions((prev) => {
      const current = prev[String(ideaId)]
      if (!current || current.reacted) return prev
      const updated = {
        ...current,
        reacted: true,
        up: type === 'up' ? current.up + 1 : current.up,
        down: type === 'down' ? current.down + 1 : current.down,
      }
      return { ...prev, [String(ideaId)]: updated }
    })
  }

  const handleEditIdea = (ideaCard: IdeaFeedCard) => {
    setEditingIdea(ideaCard)
    setEditTitle(ideaCard.idea.title)
    setEditContent(ideaCard.idea.content)
  }

  const handleSaveIdea = () => {
    if (!editingIdea) return
    setIdeas((prev) =>
      prev.map((item) =>
        item.idea.id === editingIdea.idea.id
          ? {
              ...item,
              idea: {
                ...item.idea,
                title: editTitle,
                content: editContent,
                updated_at: new Date(),
              },
            }
          : item,
      ),
    )
    setEditingIdea(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleDeleteIdea = (ideaCard: IdeaFeedCard) => {
    if (!window.confirm('Delete this idea?')) return
    setIdeas((prev) => prev.filter((item) => item.idea.id !== ideaCard.idea.id))
    if (activeIdea?.idea.id === ideaCard.idea.id) {
      setActiveIdea(null)
      setShowComments(false)
    }
  }

  return (
    <Container fluid>
      <DashboardPage title="Idea Feeds" subtitle="QA">
        <div className="position-sticky top-0 z-3 bg-body pb-3 mb-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <h5 className="mb-1">Idea Feed</h5>
              <div className="text-muted fs-xxs">
                {selectedYear ? selectedYear.name : 'All Academic Years'}
              </div>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowYearModal(true)}
            >
              Select Academic Year
            </Button>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xl={7} lg={8} md={10} sm={12}>
            <div className="d-grid gap-3">
              {filteredIdeas.map((item) => {
                const reaction = reactions[String(item.idea.id)]
                return (
                  <Card
                    key={item.idea.id}
                    className="border-0 border-bottom rounded-0"
                  >
                    <CardBody className="py-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="text-muted fs-xxs">
                            {item.idea.is_anonymous
                              ? 'Anonymous'
                              : `User #${item.idea.user_id}`}
                          </div>
                          <h5 className="mt-2 mb-1">{item.idea.title}</h5>
                        </div>
                        <div className="d-flex align-items-start gap-2">
                          <Badge bg="info-subtle" className="text-info">
                            {item.category.name}
                          </Badge>
                          {item.idea.user_id === currentUserId && (
                            <div className="d-flex gap-1">
                              <Button
                                variant="light"
                                size="sm"
                                className="btn-icon"
                                onClick={() => handleEditIdea(item)}
                              >
                                <TbEdit />
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="btn-icon text-danger"
                                onClick={() => handleDeleteIdea(item)}
                              >
                                <TbTrash />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-muted mt-2 mb-3">
                        {item.idea.content}
                      </p>

                      <div className="d-flex flex-wrap gap-3 text-muted fs-xxs">
                        <span>Views: {item.views}</span>
                        <span>Comments: {item.comments}</span>
                        <span>
                          Submitted: {item.idea.created_at.toLocaleDateString()}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
                        <Button
                          variant="light"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() =>
                            handleReaction(item.idea.id as number, 'up')
                          }
                          disabled={reaction?.reacted}
                        >
                          <TbThumbUp /> {reaction?.up ?? item.thumbsUp}
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                          onClick={() =>
                            handleReaction(item.idea.id as number, 'down')
                          }
                          disabled={reaction?.reacted}
                        >
                          <TbThumbDown /> {reaction?.down ?? item.thumbsDown}
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="ms-auto d-inline-flex align-items-center gap-1"
                          onClick={() => openComments(item)}
                        >
                          <TbMessageDots /> Comments
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          </Col>
        </Row>
      </DashboardPage>
      <IdeaCommentsDrawer
        show={showComments}
        onHide={() => {
          setShowComments(false)
          setActiveIdea(null)
        }}
        comments={commentsForActiveIdea}
        currentUserId={currentUserId}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onReply={handleReply}
      />

      <Modal show={!!editingIdea} onHide={() => setEditingIdea(null)} centered>
        <ModalHeader closeButton>
          <ModalTitle>Edit Idea</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormGroup className="mb-3">
            <FormLabel>Title</FormLabel>
            <FormControl
              type="text"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Details</FormLabel>
            <FormControl
              as="textarea"
              rows={4}
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={() => setEditingIdea(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveIdea}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        show={showYearModal}
        onHide={() => setShowYearModal(false)}
        centered
      >
        <ModalHeader closeButton>
          <ModalTitle>Select Academic Year</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {academicYears.map((year) => (
            <FormGroup key={year.id} className="mb-2">
              <FormCheck
                type="radio"
                name="academicYear"
                id={`year-${year.id}`}
                label={year.name}
                checked={selectedYearId === year.id}
                onChange={() => setSelectedYearId(year.id as number)}
              />
            </FormGroup>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={() => setShowYearModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  )
}
