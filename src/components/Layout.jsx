import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Collapse, ListGroup } from 'react-bootstrap';

// کامپوننت‌های فرضی
import RolesTable from './RolesTable';
import NewRoleForm from './NewRoleForm';
import UsersTable from './UsersTable';
import NewUserForm from './NewUserForm';
import CategoriesTable from './CategoriesTable';
import NewCategoryForm from './NewCategoryForm';
import SubCategoriesTable from './SubCategoriesTable';
import NewSubCategoryForm from './NewSubCategoryForm';
import SentencesTable from './SentencesTable';
import NewSentenceForm from './NewSentenceForm';
import RewardsTable from './RewardsTable';
import NewRewardForm from './NewRewardForm';
import RewardTypesTable from './RewardTypesTable';
import NewRewardTypeForm from './NewRewardTypeForm';
import TrendsTable from './TrendsTable';
import NewTrendForm from './NewTrendForm';
import GuidesTable from './GuidesTable';
import NewGuideForm from './NewGuideForm';
import GuideTypesTable from './GuideTypesTable';
import NewGuideTypeForm from './NewGuideTypeForm';

export default function Layout() {

  // Collapse منوها
  const [openUsers, setOpenUsers] = useState(false);
  const [openRoles, setOpenRoles] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openSubCategories, setOpenSubCategories] = useState(false);
  const [openSentences, setOpenSentences] = useState(false);
  const [openGuides, setOpenGuides] = useState(false);
  const [openGuideTypes, setOpenGuideTypes] = useState(false);
  const [openRewards, setOpenRewards] = useState(false);
  const [openRewardTypes, setOpenRewardTypes] = useState(false);
  const [openTrends, setOpenTrends] = useState(false);

  // حالت فعال سمت راست
  const [activeView, setActiveView] = useState(null); // اول هیچ چیزی نمایش داده نمی‌شود

  return (
    <Container fluid className="p-0" style={{ minHeight: '100vh' }}>
      {/* هدر */}
      <Row className='bg-primary text-white p-2 text-center'>
        <Row className='bg-primary text-white p-4 d-flex align-items-center'>
          <Col xs="auto" className="d-md-none">
            <button 
              className="btn btn-light text-dark"
              // onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              &#9776;
            </button>
          </Col>
        </Row>
      </Row>

      <Row style={{ flex: 1 }} className="g-0">
        {/* سایدبار */}
        <Col           
          md={4}
          className={`bg-dark text-white p-3 `}
          style={{ minHeight: 'calc(100vh - 64px)'}}
        >
          <h5 className='mb-4 text-center'>داشبورد</h5>
          <ListGroup variant="flush">

            {/* کاربران */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenUsers(!openUsers)}
              aria-controls="users-collapse"
              aria-expanded={openUsers}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              کاربران
              <span>{openUsers ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openUsers}>
              <div id="users-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('usersTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام کاربران
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('newUserForm')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    کاربر جدید
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* نقش‌ها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenRoles(!openRoles)}
              aria-controls="roles-collapse"
              aria-expanded={openRoles}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              نقش‌ها
              <span>{openRoles ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openRoles}>
              <div id="roles-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('rolesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام نقش‌ها
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('newRoleForm')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نقش جدید
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* دسته‌بندی‌ها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenCategories(!openCategories)}
              aria-controls="categories-collapse"
              aria-expanded={openCategories}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              دسته‌بندی‌ها
              <span>{openCategories ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openCategories}>
              <div id="categories-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('categoriesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام دسته‌بندی‌ها
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>
            {/* زیردسته‌ها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenSubCategories(!openSubCategories)}
              aria-controls="subCategories-collapse"
              aria-expanded={openSubCategories}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              زیردسته‌ها
              <span>{openSubCategories ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openSubCategories}>
              <div id="subCategories-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('subCategoriesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام زیردسته‌ها
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* جملات */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenSentences(!openSentences)}
              aria-controls="sentences-collapse"
              aria-expanded={openSentences}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              جملات
              <span>{openSentences ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openSentences}>
              <div id="sentences-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item 
                    action
                    onClick={() => setActiveView('sentencesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام جملات
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* راهنماها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenGuides(!openGuides)}
              aria-controls="guides-collapse"
              aria-expanded={openGuides}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              ایجاد اجزاء روند
              <span>{openGuides ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openGuides}>
              <div id="guides-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item
                    action
                    onClick={() => setActiveView('guideTypeTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    دسته‌بندی راهنماها
                  </ListGroup.Item>
                  <ListGroup.Item
                    action
                    onClick={() => setActiveView('guidesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    ایجاد فایل‌ راهنما
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* پاداش‌ها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenRewards(!openRewards)}
              aria-controls="rewards-collapse"
              aria-expanded={openRewards}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              پاداش‌ها
              <span>{openRewards ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openRewards}>
              <div id="rewards-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item
                    action
                    onClick={() => setActiveView('rewardTypesTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    دسته‌بندی پاداش‌ها
                  </ListGroup.Item>
                  <ListGroup.Item
                    action
                    onClick={() => setActiveView('rewardsTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    ایجاد فایل‌ پاداش
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

            {/* روندها */}
            <ListGroup.Item 
              action 
              onClick={() => setOpenTrends(!openTrends)}
              aria-controls="trends-collapse"
              aria-expanded={openTrends}
              className='mb-2 d-flex justify-content-between align-items-center rounded-1'
            >
              روندها
              <span>{openTrends ? '-' : '+'}</span>
            </ListGroup.Item>
            <Collapse in={openTrends}>
              <div id="trends-collapse">
                <ListGroup variant="flush" className="ms-3">
                  <ListGroup.Item
                    action
                    onClick={() => setActiveView('trendsTable')}
                    className='mb-1 bg-white border-0 text-dark rounded-1'
                  >
                    نمایش تمام روندها
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Collapse>

          </ListGroup>
        </Col>

        {/* محتوا سمت راست */}
        <Col xs={12} md={8} className=' p-3 ms-md-auto' style={{ minHeight: 'calc(100vh - 64px)' }}>
          
          {/* نقش‌ها */}
          {activeView === 'rolesTable' && <RolesTable onNewRole={() => setActiveView('newRoleForm')} />}
          {activeView === 'newRoleForm' && <NewRoleForm onCancel={() => setActiveView('rolesTable')} />}

          {/* کاربران */}
          {activeView === 'usersTable' && <UsersTable onNewUser={() => setActiveView('newUserForm')} />}
          {activeView === 'newUserForm' && <NewUserForm onCancel={() => setActiveView('usersTable')} />}

          {/* دسته‌بندی */}
          {activeView === 'categoriesTable' && <CategoriesTable />}

          {/* زیردسته */}
          {activeView === 'subCategoriesTable' && <SubCategoriesTable />}
          
          {/* جملات */}
          {activeView === 'sentencesTable' && <SentencesTable />}


          {/*  راهنما */}
          {activeView === 'guideTypeTable' && <GuideTypesTable />}
          {activeView === 'guidesTable' && <GuidesTable />}

          {/* پاداش‌ها */}
          {activeView === 'rewardTypesTable' && <RewardTypesTable />}
          {activeView === 'rewardsTable' && <RewardsTable />}


          {/* روندها */}
          {activeView === 'trendsTable' && <TrendsTable onNewTrend={() => setActiveView('newTrendForm')} />}

        </Col>
      </Row>
    </Container>
  );
}
