import React, { useState, useEffect } from "react";
import firebase from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useLocation } from "react-router-dom"
import { Form, Button} from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { storage } from "../firebase"
import { deleteObject, ref, uploadBytes} from "firebase/storage";
import { Card } from 'react-bootstrap';

export default function EditResource(updatedResource) {
  const { state } = useLocation();

  const [values, setValues] = useState({
    // key-value pairs of resource
    id: state.source.id,
    title: state.source.title,
    desc: state.source.desc,
    category: state.source.category,
    tags: state.source.tags,

    type: state.source.type,
    reference: state.source.reference,
    referenceChanged: null, // whether or not the attachment has been changed 

    // basically need if type is link, then we do link: state.source.reference
    link: ((state.source.type === "link") ? state.source.reference : ""),

    // if type is attachment, then we do attachmentid: state.source.reference and attachment: will not be null
    // non-key-value pair of resource
    attachment: ((state.source.type === "attachment") ? ref(storage, state.source.reference) : null)
    // attachment: null
  })

  const [formerrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const resourceRef = firebase.firestore().collection("resources");
  // const [resources, setResources] = useState([]);
  const [disableButton, setDisableButton] = useState(false);

  const navigate = useNavigate();

  const [categoryList, setCategoryList] = useState([]);
  const [tagList, setTagList] = useState([]);


  function editResource(values) {
    const refID = uuidv4()

    // change one attachment to other attachment
    if (values.attachment != null && values.referenceChanged && values.type !== "link") {
      values.type = "attachment";
      const fileRef = ref(storage, values.reference);

      deleteObject(fileRef);
      values.reference = refID;
      // values.link = refID;
      const fileRefUpdated = ref(storage, refID);
      uploadBytes(fileRefUpdated, values.attachment);
    }

    // change link to attachment
    if (values.attachment != null && values.type === "link") {
      values.type = "attachment";
      values.reference = refID;
      // values.link = refID;
      const fileRef = ref(storage, refID);
      uploadBytes(fileRef, values.attachment);
    }

    // need attachment to link
    if (values.attachment == null && values.type === "attachment" && values.link != null) {
      values.type = "link";
      const fileRef = ref(storage, values.reference);
      deleteObject(fileRef);
    }

    const updatedResource = {
      id: values.id,
      title: values.title,
      desc: values.desc,
      category: values.category,
      tags: values.tags.map((tag) => (typeof tag == "string" ? tag : tag.name)),
      // tags: values.tags,
      reference: (values.type === "attachment" ? values.reference:values.link), // attachment = string id of storage, link = string url
      type: values.type // either attachment or link
    }

    setLoading();
    resourceRef
      .doc(updatedResource.id)
      .update(updatedResource)
      .then(() => {
        // setResources((prev) =>
        //   prev.map((element) => {
        //     if (element.id !== updatedResource.id) {
        //       return element;
        //     }
        //     return updatedResource;
        //   })
        // );
        navigate('/')
      })
      .catch((err) => {
        console.error(err);
      });
  }


  function getCategoryList() {
    firebase.firestore().collection("categories").onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });
      setCategoryList(items);
    });
  }

  function getTagList() {
    firebase.firestore().collection("tags").onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data().name);
      });
      setTagList(items);
    });
  }

  const handleFormChange = (event) => {
    if (event.target.name === "attachment") {
      if (typeof event.target.files[0] == "undefined") {
        setValues((values) => ({
          ...values,
          // if no file selected, values.attachments become null
          attachment: null,
          referenceChanged: true

        }));
      } else {
        setValues((values) => ({
          ...values,
          //attachment: File;
          [event.target.name]: event.target.files[0],
          referenceChanged: true
        }));
      }
      setDisableButton(false);

    }
    else {
      setValues((values) => ({
        ...values,
        [event.target.name]: event.target.value,
      }));

    }
  };

  const handleTagChange = (tags) => {
    for (let i = 0; i < tags.length; i++) {
      if (typeof tags[i] !== 'string') {
        tags[i] = tags[i].name;
      }
    }
    setValues((values) => ({
      ...values,
      tags: tags,
    }));
  }

  const validate = () => {
    let errors = {};
    if (values.title === "") {
      errors.title = "Resource title is required"
    }
    if (values.desc === "") {
      errors.desc = "Short description of resource is required"
    }
    if (values.category === "" || values.category === "Select a Category") {
      errors.category = "Category for resource must be selected"
    }
    if (values.tags === []) {
      // if tags are required
    }
    if (values.attachment === null && values.link === "") {
      errors.ref = "Attachment or link of resource must be added"
    }
    else if (values.attachment !== null && values.link !== "") {
      errors.ref = "Cannot add a link and attachment for resource, must remove one"
    }
    setFormErrors(errors)
    if (Object.keys(errors).length === 0) {
      return true;
    }
    else {
      return false;
    }
  }

  function addTag(tagName) {
    const newTag = {
      name: tagName,
    }
    firebase.firestore().collection("tags").add(newTag);
  }

  const handleUpdate = () => {
    if (validate(values)) {
      for (const tag of values.tags) {
        if (!tagList.includes(tag)) {
          addTag(tag)
        }
      }
      editResource(values)
    }
  }

  function handleAttachmentEdit() {
    values.attachment = null;
    setDisableButton(true);
  }

  async function deleteResource() {
    // delete attachment from stoage if applicable
    if (values.type === "attachment") {
      const fileRef = ref(storage, values.reference);
      deleteObject(fileRef)
    }

    // delete resource document from collection
    resourceRef
      .doc(values.id)
      .delete()
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    getCategoryList();
    getTagList();
  }, []);

  return (
    <div>
      <div className='back-home'>
        <Button variant="link" onClick={() => {navigate('/')}} className="back-btn">&laquo; Exit</Button>
      </div>
      <div className="edit-r-Container">
        <h1>Edit Resource</h1>
        <div className="inputBox">
          <Form.Group className="form-group">
            <Form.Label>Resource Title <span className="required">*</span></Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Resource Title"
              value={values.title}
              onChange={handleFormChange}
            />
            {formerrors.title && (
              <p className="text-danger">{formerrors.title}</p>
            )}
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label>Resource Description <span className="required">*</span></Form.Label>
            <Form.Control
              type="textarea"
              name="desc"
              as="textarea"
              placeholder="Resource Description"
              value={values.desc}
              onChange={handleFormChange}
            />
            {formerrors.desc && (
              <p className="text-danger">{formerrors.desc}</p>
            )}
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label for="category" >Category <span className="required">*</span></Form.Label>
            <Form.Select
              id="category"
              name="category"
              value={values.category}
              onChange={handleFormChange}
            >
              <option>Select a Category</option>
              {categoryList.map(
                (category) => (
                  <option value={category.id}>{category.name}</option>
                )
              )}
            </Form.Select>
            {formerrors.category && (
              <p className="text-danger">{formerrors.category}</p>
            )}
          </Form.Group>

          <Form.Group className="form-group">
            <Form.Label for="tags" >Tags</Form.Label>
            <Typeahead
              allowNew
              id="tags"
              labelKey="name"
              multiple
              name="tags"
              newSelectionPrefix="Select to add a new tag: "
              onChange={handleTagChange}
              options={tagList}
              placeholder="Select tags"
              selected={values.tags}
            />
          </Form.Group>

          <Form.Group controlId="formFile" className="form-group mb-3">
            <Form.Label>Select File <b>OR</b> Add a Link <span className="required">*</span></Form.Label>
          
            
            <div class = "form-inline">
            {(values.attachment == null) ? 
                (<Form.Control type="file" name="attachment" style={{color: "transparent"}} onChange={handleFormChange}/>):
                (<>
                <div ><Button variant="secondary" disabled = {disableButton} onClick={handleAttachmentEdit}>Remove Attachment</Button></div>
                </>)
              
            }

            </div>  
          

            <div className="flex-center"><hr style={{ color: "black", width: "40%" }} /><b className="or">OR</b><hr style={{ color: "black", width: "40%" }} /></div>

            <Form.Control
              type="text"
              name="link"
              value={values.link}
              onChange={handleFormChange}
              placeholder="Paste the resource link"
            />
            {formerrors.ref && (
              <p className="text-danger">{formerrors.ref}</p>
            )}
          </Form.Group>
          <div className="btn-holder">

            <Button variant="danger" onClick={deleteResource}>Delete Resource</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>

        </div>
        <hr />
      </div>
</div>
  )
}
