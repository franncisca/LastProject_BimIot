import React, { useEffect, createRef, useState } from 'react';
import { MeshLambertMaterial } from "three";

import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { Color } from 'three';
import {
  Alert,
  Backdrop,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  CircularProgress,
  CssBaseline,
  IconButton,
  Toolbar,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { FolderOpenOutlined, CompareArrowsSharp, HelpOutline, GitHub, ViewDayRounded } from '@mui/icons-material';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';

import { IfcViewerAPI } from 'web-ifc-viewer';
import { IfcContainer } from './IfcContainer';
import { IFCLoader } from "web-ifc-three/IFCLoader";


import {IFCBUILDING,IFCWINDOW} from 'web-ifc';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

function App() {
  const theme = useTheme();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [isClippingPaneSelected, setClippingPaneSelected] = useState(false);
  const [isLoading, setLoading] = useState(false)

  const ifcContainer = createRef<HTMLDivElement>();
  const [viewer, setViewer] = useState<IfcViewerAPI>();
  const [ifcLoadingErrorMessage, setIfcLoadingErrorMessage] = useState<string>();

  const [roomWithSensor,setRoomWithSensor] = useState([]);

  const [postErrorMessage, setPostErrorMessage] = useState<string>();

  // const [isSimulationSelected, setSimulationSelected] = useState(false);
  const [isChangeColorSelected,setChangeColorSelected] = useState(false);
  // const [modelId, setModelId] = useState(0);
  // const [manager, setManager] = useState(IfcManager);

  
  useEffect(() => {
    if (ifcContainer.current) {
      const container = ifcContainer.current;
      const ifcViewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
      ifcViewer.axes.setAxes();
      ifcViewer.grid.setGrid(40);
      ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLS: false
      });
      setViewer(ifcViewer);
    }
  }, []);





  //Load the IFC file
  const ifcOnLoad = async (e) => {
    const file = e && e.target && e.target.files && e.target.files[0];
    if (file && viewer) {

      // reset
      setIfcLoadingErrorMessage('');
      setLoading(true);

      // load file
      const url = URL.createObjectURL(file);
      const model = await viewer.IFC.loadIfcUrl(url)
      // const model = await viewer.IFC.loadIfc(file, true, ifcOnLoadError);
      await viewer.shadowDropper.renderShadow(model.modelID);

      // get the structure of model
      const manager = viewer.IFC.loader.ifcManager
      // setManager(manager);
      // const structure = await manager.getSpatialStructure(model.modelID);
      const structure = await viewer.IFC.getSpatialStructure(model.modelID);
      // getAllSensor(viewer,model.modelID);
      console.log("structure: ",structure);
      // getSensorsParent(structure);
      const rooms = [];
      getSensors(structure,rooms,viewer.IFC.loader.ifcManager,model.modelID)
      console.log("rooms : ",rooms)
      setRoomWithSensor(rooms);

      // update information
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  //get all items of type Sensor
  // const getAllSensor = async (viewer,modelID) => {
  //   const mapping = new Map();
  //   const sensors = await viewer.IFC.getAllItemsOfType(modelID,IFCWINDOW,true);
  //   setSensors(sensors);
  //   sensors.forEach( element => {
  //     mapping.set(element.expressID,element.Name)

  //   });
  //   console.log("sensors",sensors)
  //   console.log("sensorMapping",mapping)
  // }


  const ifcOnLoadError = async (err) => {
    setIfcLoadingErrorMessage(err.toString());
  };

  const toggleClippingPlanes = () => {
    if (viewer) {
      // viewer.toggleClippingPlanes(); 
      //Change depeatched 
      //Opens a dropbox window where the user can select their IFC models.
      viewer.dropbox.loadDropboxIfc()
      if (viewer.clipper.active) {
        setClippingPaneSelected(true);
      } else {
        setClippingPaneSelected(false);
      }
    }
  }

  const changeColor = () =>{
    setChangeColorSelected(!isChangeColorSelected);
    if(viewer){
      if(isChangeColorSelected){
        // const manager = viewer.IFC.loader.ifcManager;
        const manager = viewer.IFC.loader.ifcManager;
        // const modelID = modelID;
        const scene = viewer.context.getScene();
        console.log("manager: ", manager);
        console.log("scene: ",scene);

        changeColorOfMaterials(manager,0,[22620],scene)
      }
    }
    // setChangeColorSelected(false);
    console.log("is selected : ", isChangeColorSelected);

  }

  // get all the sensors in a model
  const getSensors = async (relIDs, rooms, manager, modelID) => {
    if (relIDs.type == "IFCBUILDINGSTOREY") {
        const sensorList = [];
        rooms.push({roomId:relIDs.expressID, sensors:sensorList});
    }
    for (let component in relIDs.children) {
        if (relIDs.type == "IFCBUILDINGSTOREY" && relIDs.children[component].type == "IFCFURNISHINGELEMENT") {
            const sensor = await manager.getItemProperties(modelID, relIDs.children[component].expressID);
            //
            rooms[rooms.length-1].sensors.push({sensorIFCid:relIDs.children[component].expressID, sensorDataSetId:sensor.Name.value});
        }
        await getSensors(relIDs.children[component], rooms, manager, modelID);
    }
  }

  //send sensors to back by post
  // useEffect(()=>{
  //   const requestOptions = {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(roomWithSensor)
  //   };
  //   fetch('https://localhost:8080', requestOptions)
  //     .then(response => response.json())
  //     .then(data => console.log("rooms from data: ",data))
  //     .catch(error => {
  //       setPostErrorMessage( error.toString());
  //       console.error('There was an error!', error);
  //   });;

  // },[])


  const changeColorOfMaterials = (manager, modelId, ids, scene) => {
    const preselectMat = new MeshLambertMaterial({
      transparent: true,
      opacity: 0.6,
      color: 0xff88ff,
      depthTest: false,
    });
    // const customID = "test-subset"

    console.log("mesh material : ",preselectMat)

      manager.createSubset({
      modelID: modelId,
      ids: ids,
      material: preselectMat,
      scene: scene,
      removePrevious: true
    })

    // if(viewer){
      // viewer.IFC.loader.ifcManager.createSubset({
    //     scene: scene,
    //     modelID: modelId,
    //     ids: ids,
    //     removePrevious: true,
    //     material: preselectMat,
    //     customID: customID
    //   });
    // }
  }

  // const changeColor = () => {
  //   if(viewer){
  //     if (isChangeColorSelected){
  //       changeColorOfMaterials(viewer.IFC.loader.ifcManager,viewer.IFC.loadIfc.model.modelId,[128],viewer)
  //     }
  //   }
    
  // }
  



  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position='fixed' open={isDrawerOpen}>
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              onClick={() => setDrawerOpen(true)}
              edge='start'
              sx={{
                marginRight: '36px',
                ...(isDrawerOpen && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' noWrap component='div'>
              Ifc.js React MUI Viewer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant='permanent' open={isDrawerOpen}>
          <DrawerHeader>
            <IconButton onClick={() => setDrawerOpen(false)}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <input
              type='file'
              id='file'
              accept='.ifc'
              onChange={ifcOnLoad}
              style={{ display: 'none' }}
            />
            <label htmlFor='file'>
              <ListItem button key={'openFile'}>
                <ListItemIcon>
                  <FolderOpenOutlined />
                </ListItemIcon>
                <ListItemText primary={'Open File'} />
              </ListItem>
            </label>
            {/* <ListItem button key={'showPlane'} onClick={() => toggleClippingPlanes()}
              selected={isClippingPaneSelected}>
              <ListItemIcon>
                <CompareArrowsSharp />
              </ListItemIcon>
              <ListItemText primary={'Clipping Planes'} />
            </ListItem> */}

            {/* add simulation button */}
            <ListItem button key={"simulate"} onClick={() => changeColor()}
              selected={isChangeColorSelected}
              >
                <ListItemIcon>
                  <PlayCircleFilledWhiteIcon/>
                </ListItemIcon>
                <ListItemText primary={'Start a simulation'}/>
            </ListItem>


  
          </List>
          <Divider />
          <List>
            <ListItem button key={'About'} onClick={() => setDialogOpen(true)} >
              <ListItemIcon>
                <HelpOutline />
              </ListItemIcon>
              <ListItemText primary={'About'} />
            </ListItem>
          </List>
        </Drawer>
        <Box component='main' sx={{ flexGrow: 1 }}>
          <DrawerHeader />
          <IfcContainer
            ref={ifcContainer}
            viewer={viewer} />
        </Box>
      </Box>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>

      <Dialog onClose={() => setDialogOpen(false)} open={isDialogOpen}>
        <DialogTitle>About</DialogTitle>
        <DialogContent>
          <List dense>
            <ListItem>
              <ListItemText
                primary='right-click' secondary='Create a Plan'
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='double-click' secondary='Pick an Item'
              />
            </ListItem>
          </List>
          <Link href='https://github.com/IFCjs' underline='hover' target='_blank'>
            Join us on GitHub
          </Link>
          <GitHub />
        </DialogContent>
      </Dialog>

      <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        {ifcLoadingErrorMessage ?
          <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
            Error loading the IFC File. Check the console for more information.
          </Alert>
          : <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            IFC File loaded successfully!
          </Alert>}
      </Snackbar>
    </>
  );
}

export { App };
